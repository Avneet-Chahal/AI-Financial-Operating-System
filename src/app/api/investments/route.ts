/**
 * Investment Agent API — GET /api/investments
 *
 * Returns portfolio analysis from the Investment Agent including
 * asset allocation, unrealized gains, risk profile, and tax-saving opportunities.
 */
import { NextResponse } from 'next/server';
import type { InvestmentAnalysis } from '@/lib/investment-agent';
import { analyzeInvestments } from '@/lib/investment-agent';

export function GET(): NextResponse<InvestmentAnalysis> {
  const analysis = analyzeInvestments();
  return NextResponse.json(analysis);
}
