/**
 * Investment Agent API — GET /api/investments
 *
 * Returns portfolio analysis (asset allocation, unrealized gains, risk profile,
 * tax-saving opportunities) for the authenticated user. Holdings currently use a
 * representative seed portfolio (brokerage sync is a future integration).
 */
import { NextResponse } from 'next/server';
import type { InvestmentAnalysis } from '@/lib/investment-agent';
import { analyzeInvestments } from '@/lib/investment-agent';
import { getCurrentUserId } from '@/lib/data';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const analysis: InvestmentAnalysis = analyzeInvestments();
  return NextResponse.json(analysis);
}
