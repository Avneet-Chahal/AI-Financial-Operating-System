/**
 * LangChain Orchestration Layer — Core Logic (MUST tier)
 *
 * This module simulates the LangChain multi-agent orchestration pipeline in TypeScript.
 * In production this would be a Python/LangChain microservice; here it mirrors the same
 * architecture: tool calling, context assembly (RAG), conversation memory, and synthesis.
 *
 * Pipeline:
 *   1. TOOL CALLING   — invoke each agent as a discrete "tool"
 *   2. CONTEXT (RAG)  — assemble a structured financial context object
 *   3. MEMORY         — cache last summary for follow-up questions
 *   4. SYNTHESIS      — generate plain-language overview + ranked recommendations
 *   5. OUTPUT         — return a typed OrchestratorSummary
 */

import type { OrchestratorSummary, AgentType, ActionableRecommendation } from '@/types';
import { analyzeBudget, getCategorizedTransactions } from './spending-agent';
import { analyzeInvestments } from './investment-agent';
import { estimateTax } from './tax-agent';

// ─── Memory Store (in-memory; Redis-ready interface) ─────────────────────────

interface MemoryEntry {
  timestamp: string;
  summary: OrchestratorSummary;
}

let _memory: MemoryEntry | null = null;

export function clearMemory(): void {
  _memory = null;
}

// ─── Tool Definitions (LangChain-style) ──────────────────────────────────────

interface AgentToolResult {
  agentName: AgentType;
  status: 'ACTIVE' | 'IDLE' | 'ERROR';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

async function invokeSpendingTool(): Promise<AgentToolResult> {
  try {
    const transactions = getCategorizedTransactions();
    const summary = analyzeBudget(transactions);
    return { agentName: 'SPENDING', status: 'ACTIVE', data: { summary, transactionCount: transactions.length } };
  } catch {
    return { agentName: 'SPENDING', status: 'ERROR', data: {} };
  }
}

async function invokeInvestmentTool(): Promise<AgentToolResult> {
  try {
    const analysis = analyzeInvestments();
    return { agentName: 'INVESTMENT', status: 'ACTIVE', data: { analysis } };
  } catch {
    return { agentName: 'INVESTMENT', status: 'ERROR', data: {} };
  }
}

async function invokeTaxTool(): Promise<AgentToolResult> {
  try {
    const estimation = estimateTax();
    return { agentName: 'TAX', status: 'ACTIVE', data: { estimation } };
  } catch {
    return { agentName: 'TAX', status: 'ERROR', data: {} };
  }
}

// ─── RAG Context Assembly ─────────────────────────────────────────────────────

interface FinancialContext {
  spending: AgentToolResult;
  investment: AgentToolResult;
  tax: AgentToolResult;
}

async function assembleContext(): Promise<{ context: FinancialContext; toolsInvoked: AgentType[] }> {
  // Run all tools in parallel (LangChain parallel tool calling)
  const [spending, investment, tax] = await Promise.all([
    invokeSpendingTool(),
    invokeInvestmentTool(),
    invokeTaxTool(),
  ]);

  const toolsInvoked: AgentType[] = [spending, investment, tax]
    .filter((t) => t.status === 'ACTIVE')
    .map((t) => t.agentName);

  return { context: { spending, investment, tax }, toolsInvoked };
}

// ─── Synthesis (LangChain prompt → structured output) ─────────────────────────

function synthesize(context: FinancialContext): {
  overview: string;
  insights: string[];
  recommendations: ActionableRecommendation[];
} {
  const insights: string[] = [];
  const recommendations: ActionableRecommendation[] = [];

  // ── Spending insights ──
  if (context.spending.status === 'ACTIVE') {
    const { summary } = context.spending.data as { summary: import('@/types').SpendingSummary };
    const budgetUsedPct = Math.round((summary.totalSpent / summary.monthlyBudget) * 100);

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

  // ── Investment insights ──
  if (context.investment.status === 'ACTIVE') {
    const { analysis } = context.investment.data as { analysis: import('./investment-agent').InvestmentAnalysis };
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

  // ── Tax insights ──
  if (context.tax.status === 'ACTIVE') {
    const { estimation } = context.tax.data as { estimation: import('@/types').TaxEstimation };
    const saving = Math.abs(estimation.estimatedTaxOldRegime - estimation.estimatedTaxNewRegime);
    insights.push(
      `The ${estimation.recommendedRegime} tax regime saves you ₹${saving.toLocaleString('en-IN')} vs the other option.`
    );
  }

  // ── Plain-language overview ──
  const budgetUsed = context.spending.status === 'ACTIVE'
    ? Math.round(
        ((context.spending.data as { summary: import('@/types').SpendingSummary }).summary.totalSpent /
          (context.spending.data as { summary: import('@/types').SpendingSummary }).summary.monthlyBudget) *
          100
      )
    : 0;

  const portfolioValue = context.investment.status === 'ACTIVE'
    ? (context.investment.data as { analysis: import('./investment-agent').InvestmentAnalysis }).analysis.portfolio.totalValue
    : 0;

  const overview =
    `You've used ${budgetUsed}% of your monthly budget and your portfolio stands at ₹${portfolioValue.toLocaleString('en-IN')}. ` +
    `${recommendations.length > 0 ? `Top priority action: ${recommendations[0].title}.` : 'Your finances are on track — great work!'}`;

  // Sort recommendations by impact score desc
  recommendations.sort((a, b) => b.impactScore - a.impactScore);

  return { overview, insights, recommendations };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function runOrchestrator(userId: string = 'user_123'): Promise<OrchestratorSummary> {
  // Return cached summary if generated within last 60 seconds
  if (_memory && Date.now() - new Date(_memory.timestamp).getTime() < 60_000) {
    return _memory.summary;
  }

  const { context, toolsInvoked } = await assembleContext();
  const { overview, insights, recommendations } = synthesize(context);

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

  _memory = { timestamp: result.timestamp, summary: result };
  return result;
}
