import { NextResponse } from 'next/server';
import { analyzeBudget, getCategorizedTransactions } from '@/lib/spending-agent';

export async function GET() {
  const transactions = getCategorizedTransactions();
  const summary = analyzeBudget(transactions);
  return NextResponse.json(summary);
}
