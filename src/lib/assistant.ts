/**
 * AI Assistant (search bar) — answers plain-language questions about the user's
 * own finances. It assembles the same agent context the orchestrator uses, then:
 *   - with an Anthropic key → asks Claude for a grounded answer;
 *   - without one → answers deterministically from the computed numbers.
 * Either way the answer is grounded in the signed-in user's real data.
 */
import type { Category, SpendingSummary, TaxEstimation } from '@/types';
import { analyzeBudget } from './spending-agent';
import { analyzeInvestmentsForUser, type InvestmentAnalysis } from './investment-agent';
import { estimateTax, deriveTaxInput } from './tax-agent';
import { getUserProfile, getUserTransactions, deriveMonthlyBudget } from './data';
import { isLlmConfigured, answerFinancialQuestion } from './llm';

export interface AssistantContext {
  summary: SpendingSummary;
  transactionCount: number;
  investment: InvestmentAnalysis | null;
  tax: TaxEstimation | null;
  hasIncome: boolean;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Assemble the user's financial context from the agent modules. */
export async function buildAssistantContext(userId: string): Promise<AssistantContext> {
  const [profile, transactions] = await Promise.all([
    getUserProfile(userId),
    getUserTransactions(userId),
  ]);

  const summary = analyzeBudget(transactions, deriveMonthlyBudget(profile));
  const investment = analyzeInvestmentsForUser(transactions);
  const hasIncome = !!profile && profile.monthlyIncome > 0;
  const tax = hasIncome ? estimateTax(deriveTaxInput(profile, transactions)) : null;

  return { summary, transactionCount: transactions.length, investment, tax, hasIncome };
}

/** Compact, human-readable dump of the context for the LLM prompt. */
export function contextToText(ctx: AssistantContext): string {
  const { summary } = ctx;
  const lines: string[] = [];
  const pct = summary.monthlyBudget > 0 ? Math.round((summary.totalSpent / summary.monthlyBudget) * 100) : 0;

  lines.push(
    `SPENDING: ${ctx.transactionCount} transactions. Spent ${inr(summary.totalSpent)} of a ${inr(
      summary.monthlyBudget
    )} monthly budget (${pct}%). Top category: ${summary.topCategory.replace('_', ' ')}. Next-month forecast: ${inr(
      summary.forecastedNextMonth
    )}.`,
    `Category breakdown: ${(Object.entries(summary.categoryBreakdown) as [Category, number][])
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k.replace('_', ' ')} ${inr(v)}`)
      .join(', ') || 'none'}.`
  );

  if (ctx.investment) {
    const a = ctx.investment;
    lines.push(
      `INVESTMENT: Portfolio ${inr(a.portfolio.totalValue)}, unrealised gains ${inr(
        a.portfolio.unrealizedGains
      )} (${a.annualizedReturn}%). Risk: ${a.riskLabel}. Allocation: equity ${a.portfolio.allocation.equityPercentage}%, debt ${a.portfolio.allocation.debtPercentage}%, gold ${a.portfolio.allocation.goldPercentage}%, cash ${a.portfolio.allocation.cashPercentage}%.`
    );
  } else {
    lines.push('INVESTMENT: No investment transactions on record.');
  }

  if (ctx.tax) {
    lines.push(
      `TAX: Old regime ${inr(ctx.tax.estimatedTaxOldRegime)}, new regime ${inr(
        ctx.tax.estimatedTaxNewRegime
      )}. Recommended: ${ctx.tax.recommendedRegime}.`
    );
  } else {
    lines.push('TAX: No income set, so tax cannot be estimated yet.');
  }

  return lines.join('\n');
}

// ─── Deterministic answerer (no LLM key) ───────────────────────────────────────

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  FOOD_DINING: ['food', 'dining', 'eat', 'restaurant', 'swiggy', 'zomato', 'grocery', 'groceries'],
  HOUSING: ['rent', 'housing', 'home', 'apartment', 'landlord'],
  TRANSPORTATION: ['transport', 'travel', 'uber', 'ola', 'fuel', 'petrol', 'cab', 'commute'],
  ENTERTAINMENT: ['entertainment', 'netflix', 'movie', 'movies', 'subscription', 'fun'],
  UTILITIES: ['utility', 'utilities', 'bill', 'bills', 'electricity', 'internet', 'recharge'],
  INVESTMENTS: ['investment', 'investments', 'sip', 'mutual fund', 'portfolio', 'invest'],
  MISCELLANEOUS: ['misc', 'miscellaneous', 'other'],
};

/**
 * Answer a question from the computed numbers with simple intent matching.
 * Covers the common questions the search bar suggests ("How much did I spend on food?").
 */
export function answerQueryDeterministic(question: string, ctx: AssistantContext): string {
  const q = question.toLowerCase();
  const { summary } = ctx;

  // Category-specific spend.
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    if (keywords.some((kw) => q.includes(kw))) {
      const amount = summary.categoryBreakdown[cat] ?? 0;
      if (cat === 'INVESTMENTS' && ctx.investment) {
        const a = ctx.investment;
        return `Your portfolio is worth ${inr(a.portfolio.totalValue)} with ${inr(
          a.portfolio.unrealizedGains
        )} unrealised gains (${a.annualizedReturn}% return), and you've invested ${inr(amount)} this period.`;
      }
      const label = cat.replace('_', ' ').toLowerCase();
      return amount > 0
        ? `You've spent ${inr(amount)} on ${label} this month — that's ${
            summary.totalSpent > 0 ? Math.round((amount / summary.totalSpent) * 100) : 0
          }% of your total spending.`
        : `You have no ${label} spending recorded this month.`;
    }
  }

  // Tax.
  if (q.includes('tax') || q.includes('regime') || q.includes('80c')) {
    if (!ctx.tax) return 'Set your annual income on the Taxes page to get a tax estimate and regime comparison.';
    const saving = Math.abs(ctx.tax.estimatedTaxOldRegime - ctx.tax.estimatedTaxNewRegime);
    return `Your estimated tax is ${inr(ctx.tax.estimatedTaxOldRegime)} (Old) vs ${inr(
      ctx.tax.estimatedTaxNewRegime
    )} (New). The ${ctx.tax.recommendedRegime} regime saves you ${inr(saving)}.`;
  }

  // Budget.
  if (q.includes('budget') || q.includes('left') || q.includes('remaining')) {
    const remaining = summary.monthlyBudget - summary.totalSpent;
    const pct = summary.monthlyBudget > 0 ? Math.round((summary.totalSpent / summary.monthlyBudget) * 100) : 0;
    return `You've used ${pct}% of your ${inr(summary.monthlyBudget)} monthly budget (${inr(
      summary.totalSpent
    )} spent), leaving ${inr(Math.max(0, remaining))}.`;
  }

  // Savings / forecast.
  if (q.includes('save') || q.includes('saving') || q.includes('forecast') || q.includes('next month')) {
    return `Your forecast for next month is ${inr(summary.forecastedNextMonth)}, against a ${inr(
      summary.monthlyBudget
    )} budget. Your biggest category is ${summary.topCategory.replace('_', ' ').toLowerCase()}.`;
  }

  // Total spend / catch-all summary.
  return `You've spent ${inr(summary.totalSpent)} across ${ctx.transactionCount} transactions this month, mostly on ${summary.topCategory
    .replace('_', ' ')
    .toLowerCase()}. Ask me about a category (e.g. "food", "rent"), your budget, investments, or taxes.`;
}

/**
 * Answer a question end-to-end: Claude when configured, deterministic otherwise.
 * Never throws for a missing key — it degrades gracefully.
 */
export async function answerQuestion(userId: string, question: string): Promise<{ answer: string; aiPowered: boolean }> {
  const ctx = await buildAssistantContext(userId);

  if (isLlmConfigured()) {
    try {
      const answer = await answerFinancialQuestion(question, contextToText(ctx));
      if (answer) return { answer, aiPowered: true };
    } catch (err) {
      console.error('[assistant] LLM answer failed, using deterministic fallback:', err);
    }
  }

  return { answer: answerQueryDeterministic(question, ctx), aiPowered: false };
}
