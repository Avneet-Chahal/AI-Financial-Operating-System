/**
 * Spending Agent API — GET /api/expenses
 *
 * Returns auto-categorized transactions and a full SpendingSummary
 * produced by the Spending Agent. This data feeds the LangChain Orchestration Layer.
 */
import { NextResponse } from 'next/server';
import type { SpendingSummary, Transaction } from '@/types';
import { analyzeBudget, getCategorizedTransactions } from '@/lib/spending-agent';

export interface ExpensesResponse {
  transactions: Transaction[];
  summary: SpendingSummary;
}

export function GET(request: Request): NextResponse<ExpensesResponse> | NextResponse<{ transactions: Transaction[]; summary: SpendingSummary }> {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get('category');

  const allTransactions = getCategorizedTransactions();
  const summary = analyzeBudget(allTransactions);

  const transactions = categoryFilter
    ? allTransactions.filter((tx) => tx.category === categoryFilter)
    : allTransactions;

  return NextResponse.json({ transactions, summary });
}

export async function POST(request: Request): Promise<NextResponse> {
  const data = await request.json() as Partial<Transaction>;
  // In production: validate + persist to database
  return NextResponse.json({ success: true, transaction: data }, { status: 201 });
}
