/**
 * Investment Agent API — GET /api/investments
 *
 * Returns portfolio analysis (asset allocation, unrealized gains, risk profile,
 * tax-saving opportunities) for the authenticated user. Holdings currently use a
 * representative seed portfolio (brokerage sync is a future integration).
 */
import { NextResponse } from 'next/server';
import type { InvestmentAnalysis } from '@/lib/investment-agent';
import { analyzeInvestmentsForUser } from '@/lib/investment-agent';
import { getCurrentUserId, getUserTransactions } from '@/lib/data';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const transactions = await getUserTransactions(userId);
  const analysis: InvestmentAnalysis | null = analyzeInvestmentsForUser(transactions);
  if (!analysis) {
    return NextResponse.json(
      { error: 'NO_INVESTMENTS', message: 'No investment transactions found for this user.' },
      { status: 404 }
    );
  }
  return NextResponse.json(analysis);
}
