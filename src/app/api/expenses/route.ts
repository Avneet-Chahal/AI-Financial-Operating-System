import { NextResponse } from 'next/server';
import type { SpendingSummary, Transaction } from '@/types';
import { analyzeBudget, getCategorizedTransactions } from '@/lib/spending-agent';

/**
 * Spending Agent API — GET /api/expenses
 *
 * Auto-categorizes the seeded transactions and returns them alongside a
 * SpendingSummary (total spent, top category, breakdown, next-month forecast).
 * The AI Orchestrator consumes `summary` to produce plain-language insights.
 */
export interface ExpensesResponse {
  transactions: Transaction[];
  summary: SpendingSummary;
}

export function GET(): NextResponse<ExpensesResponse> {
  const transactions = getCategorizedTransactions();
  const summary = analyzeBudget(transactions);

  return NextResponse.json({ transactions, summary });
}
