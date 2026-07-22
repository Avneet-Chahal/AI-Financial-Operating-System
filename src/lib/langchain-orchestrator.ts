/**
 * LangChain Orchestration Layer — Core Logic (MUST tier)
 *
 * Coordinates the specialized agents over the user's REAL data and synthesizes a
 * plain-language briefing with Claude (via LangChain).
 *
 * Pipeline:
 *   1. TOOL CALLING   — invoke each agent as a discrete "tool" over the user's data
 *   2. CONTEXT (RAG)  — assemble a structured financial context object
 *   3. MEMORY + CACHE — Redis: cache the latest summary (60s) + keep conversation memory
 *   4. SYNTHESIS      — Claude generates the overview + ranked recommendations
 *                       (deterministic fallback when no API key is configured)
 *   5. OUTPUT         — return a typed OrchestratorSummary
 */

import type {
  OrchestratorSummary,
  AgentType,
  ActionableRecommendation,
  SpendingSummary,
  TaxEstimation,
} from '@/types';
import { analyzeBudget } from './spending-agent';
import { analyzeInvestments, type InvestmentAnalysis } from './investment-agent';
import { estimateTax, deriveTaxInput } from './tax-agent';
import { getUserProfile, getUserTransactions, deriveMonthlyBudget } from './data';
import { cache } from './redis';
import { isLlmConfigured, synthesizeFinancialSummary } from './llm';

// ─── Redis keys ───────────────────────────────────────────────────────────────

const summaryKey = (userId: string) => `orchestrator:summary:${userId}`;
const memoryKey = (userId: string) => `orchestrator:memory:${userId}`;
const SUMMARY_TTL_SECONDS = 60;
const MEMORY_CAP = 20;

/** Clear a user's cached summary (e.g. after new data is uploaded). */
export async function clearMemory(userId: string): Promise<void> {
  await cache.setJSON(summaryKey(userId), null, 1);
}

// ─── Tool definitions (LangChain-style) ───────────────────────────────────────

interface AgentToolResult {
  agentName: AgentType;
  status: 'ACTIVE' | 'IDLE' | 'ERROR';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

interface FinancialContext {
  spending: AgentToolResult;
  investment: AgentToolResult;
  tax: AgentToolResult;
}

async function assembleContext(
  userId: string
): Promise<{ context: FinancialContext; toolsInvoked: AgentType[] }> {
  const [profile, transactions] = await Promise.all([
    getUserProfile(userId),
    getUserTransactions(userId),
  ]);

  const spending: AgentToolResult = (() => {
    try {
      const summary = analyzeBudget(transactions, deriveMonthlyBudget(profile));
      return { agentName: 'SPENDING', status: 'ACTIVE', data: { summary, transactionCount: transactions.length } };
    } catch {
      return { agentName: 'SPENDING', status: 'ERROR', data: {} };
    }
  })();

  const investment: AgentToolResult = (() => {
    try {
      return { agentName: 'INVESTMENT', status: 'ACTIVE', data: { analysis: analyzeInvestments() } };
    } catch {
      return { agentName: 'INVESTMENT', status: 'ERROR', data: {} };
    }
  })();

  const tax: AgentToolResult = (() => {
    try {
      const estimation = estimateTax(deriveTaxInput(profile, transactions));
      return { agentName: 'TAX', status: 'ACTIVE', data: { estimation } };
    } catch {
      return { agentName: 'TAX', status: 'ERROR', data: {} };
    }
  })();

  const toolsInvoked: AgentType[] = [spending, investment, tax]
    .filter((t) => t.status === 'ACTIVE')
    .map((t) => t.agentName);

  return { context: { spending, investment, tax }, toolsInvoked };
}

// ─── RAG context → prompt text ────────────────────────────────────────────────

function buildContextText(context: FinancialContext): string {
  const lines: string[] = [];

  if (context.spending.status === 'ACTIVE') {
    const { summary } = context.spending.data as { summary: SpendingSummary };
    const pct = summary.monthlyBudget > 0 ? Math.round((summary.totalSpent / summary.monthlyBudget) * 100) : 0;
    lines.push(
      `SPENDING: Spent ₹${summary.totalSpent.toLocaleString('en-IN')} of a ₹${summary.monthlyBudget.toLocaleString('en-IN')} monthly budget (${pct}%).`,
      `Top category: ${summary.topCategory.replace('_', ' ')} at ₹${summary.categoryBreakdown[summary.topCategory].toLocaleString('en-IN')}.`,
      `Next-month forecast: ₹${summary.forecastedNextMonth.toLocaleString('en-IN')}.`,
      `Category breakdown: ${Object.entries(summary.categoryBreakdown)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k.replace('_', ' ')} ₹${v.toLocaleString('en-IN')}`)
        .join(', ')}.`
    );
  }

  if (context.investment.status === 'ACTIVE') {
    const { analysis } = context.investment.data as { analysis: InvestmentAnalysis };
    lines.push(
      `INVESTMENT: Portfolio ₹${analysis.portfolio.totalValue.toLocaleString('en-IN')}, unrealised gains ₹${analysis.portfolio.unrealizedGains.toLocaleString('en-IN')} (${analysis.annualizedReturn}%). Risk: ${analysis.riskLabel}.`,
      `Tax-saving headroom: ${analysis.taxSavingHeadroom
        .map((t) => `${t.section} ₹${t.remaining.toLocaleString('en-IN')} remaining (saves ~₹${t.estimatedTaxSaving.toLocaleString('en-IN')})`)
        .join('; ')}.`
    );
  }

  if (context.tax.status === 'ACTIVE') {
    const { estimation } = context.tax.data as { estimation: TaxEstimation };
    lines.push(
      `TAX: Old regime ₹${estimation.estimatedTaxOldRegime.toLocaleString('en-IN')}, new regime ₹${estimation.estimatedTaxNewRegime.toLocaleString('en-IN')}. Recommended: ${estimation.recommendedRegime}.`
    );
  }

  return lines.join('\n');
}

// ─── Deterministic synthesis (fallback when no LLM configured) ─────────────────

function synthesizeDeterministic(context: FinancialContext): {
  overview: string;
  insights: string[];
  recommendations: ActionableRecommendation[];
} {
  const insights: string[] = [];
  const recommendations: ActionableRecommendation[] = [];

  if (context.spending.status === 'ACTIVE') {
    const { summary } = context.spending.data as { summary: SpendingSummary };
    const budgetUsedPct = summary.monthlyBudget > 0 ? Math.round((summary.totalSpent / summary.monthlyBudget) * 100) : 0;
    insights.push(
      `You've spent ₹${summary.totalSpent.toLocaleString('en-IN')} this month — ${budgetUsedPct}% of your ₹${summary.monthlyBudget.toLocaleString('en-IN')} budget.`
    );
    insights.push(
      `Largest expense category: ${summary.topCategory.replace('_', ' ')} at ₹${summary.categoryBreakdown[summary.topCategory].toLocaleString('en-IN')}.`
    );
    if (summary.forecastedNextMonth > summary.monthlyBudget) {
      const overrun = summary.forecastedNextMonth - summary.monthlyBudget;
      recommendations.push({
        id: 'rec_budget_overrun',
        title: `Reduce discretionary spending by ₹${overrun.toLocaleString('en-IN')}`,
        description: `Your forecast for next month (₹${summary.forecastedNextMonth.toLocaleString('en-IN')}) exceeds your budget. Cutting back on dining and entertainment can close the gap.`,
        impactScore: 8,
        sourceAgent: 'SPENDING',
      });
    }
  }

  if (context.investment.status === 'ACTIVE') {
    const { analysis } = context.investment.data as { analysis: InvestmentAnalysis };
    insights.push(
      `Your portfolio is worth ₹${analysis.portfolio.totalValue.toLocaleString('en-IN')} with unrealised gains of ₹${analysis.portfolio.unrealizedGains.toLocaleString('en-IN')} (+${analysis.annualizedReturn}%).`
    );
    const top80C = analysis.taxSavingHeadroom.find((t) => t.section === '80C');
    if (top80C && top80C.remaining > 0) {
      recommendations.push({
        id: 'rec_80c',
        title: `Invest ₹${top80C.remaining.toLocaleString('en-IN')} to max out Section 80C`,
        description: `You can save up to ₹${top80C.estimatedTaxSaving.toLocaleString('en-IN')} in taxes by utilising your remaining 80C headroom before March 31.`,
        impactScore: 9,
        sourceAgent: 'INVESTMENT',
      });
    }
    const nps = analysis.taxSavingHeadroom.find((t) => t.section === '80CCD');
    if (nps && nps.remaining > 0) {
      recommendations.push({
        id: 'rec_nps',
        title: 'Start NPS for additional ₹50,000 tax deduction',
        description: `Section 80CCD(1B) gives you an extra ₹50,000 deduction over 80C. Estimated additional tax saving: ₹${nps.estimatedTaxSaving.toLocaleString('en-IN')}.`,
        impactScore: 7,
        sourceAgent: 'INVESTMENT',
      });
    }
  }

  if (context.tax.status === 'ACTIVE') {
    const { estimation } = context.tax.data as { estimation: TaxEstimation };
    const saving = Math.abs(estimation.estimatedTaxOldRegime - estimation.estimatedTaxNewRegime);
    insights.push(
      `The ${estimation.recommendedRegime} tax regime saves you ₹${saving.toLocaleString('en-IN')} vs the other option.`
    );
  }

  const budgetUsed = context.spending.status === 'ACTIVE'
    ? (() => {
        const s = (context.spending.data as { summary: SpendingSummary }).summary;
        return s.monthlyBudget > 0 ? Math.round((s.totalSpent / s.monthlyBudget) * 100) : 0;
      })()
    : 0;
  const portfolioValue = context.investment.status === 'ACTIVE'
    ? (context.investment.data as { analysis: InvestmentAnalysis }).analysis.portfolio.totalValue
    : 0;

  recommendations.sort((a, b) => b.impactScore - a.impactScore);

  const overview =
    `You've used ${budgetUsed}% of your monthly budget and your portfolio stands at ₹${portfolioValue.toLocaleString('en-IN')}. ` +
    `${recommendations.length > 0 ? `Top priority action: ${recommendations[0].title}.` : 'Your finances are on track — great work!'}`;

  return { overview, insights, recommendations };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function runOrchestrator(userId: string): Promise<OrchestratorSummary> {
  // 1. Redis summary cache (per user, short TTL).
  const cached = await cache.getJSON<OrchestratorSummary>(summaryKey(userId));
  if (cached) return cached;

  // 2. Tool calling + RAG context over the user's real data.
  const { context, toolsInvoked } = await assembleContext(userId);

  // 3. Synthesis — Claude if configured, deterministic otherwise.
  let overview: string;
  let insights: string[];
  let recommendations: ActionableRecommendation[];

  if (isLlmConfigured()) {
    try {
      const result = await synthesizeFinancialSummary(buildContextText(context));
      overview = result.overview;
      insights = result.insights;
      recommendations = result.recommendations;
    } catch (err) {
      console.error('[orchestrator] LLM synthesis failed, using deterministic fallback:', err);
      ({ overview, insights, recommendations } = synthesizeDeterministic(context));
    }
  } else {
    ({ overview, insights, recommendations } = synthesizeDeterministic(context));
  }

  const agentStatus: OrchestratorSummary['agentStatus'] = {
    SPENDING: context.spending.status,
    INVESTMENT: context.investment.status,
    TAX: context.tax.status,
    LOAN: 'IDLE',
    FRAUD: 'IDLE',
    GOAL_PLANNING: 'IDLE',
    ECONOMIC_INTELLIGENCE: 'IDLE',
  };

  const result: OrchestratorSummary = {
    id: `orch_${Date.now()}`,
    userId,
    timestamp: new Date().toISOString(),
    plainLanguageOverview: overview,
    keyInsights: insights,
    primaryRecommendation: recommendations[0] ?? {
      id: 'rec_default',
      title: 'Keep up the great work!',
      description: 'Your spending and investments are well-balanced. Continue your SIP contributions.',
      impactScore: 5,
      sourceAgent: 'SPENDING',
    },
    agentStatus,
    toolsInvoked,
  };

  // 4. Persist to Redis: cache this summary + append to conversation memory.
  await Promise.all([
    cache.setJSON(summaryKey(userId), result, SUMMARY_TTL_SECONDS),
    cache.pushHistory(
      memoryKey(userId),
      { timestamp: result.timestamp, overview: result.plainLanguageOverview },
      MEMORY_CAP
    ),
  ]);

  return result;
}
