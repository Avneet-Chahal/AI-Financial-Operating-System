/**
 * Tax Agent API — GET /api/taxes
 *
 * Returns tax estimation for the authenticated user (old vs new regime, deduction
 * breakdown, recommended regime), with inputs derived from their real profile +
 * transactions.
 */
import { NextResponse } from 'next/server';
import type { TaxEstimation } from '@/types';
import { estimateTax, deriveTaxInput } from '@/lib/tax-agent';
import { getCurrentUserId, getUserProfile, getUserTransactions } from '@/lib/data';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [profile, transactions] = await Promise.all([
    getUserProfile(userId),
    getUserTransactions(userId),
  ]);
  const estimation: TaxEstimation = estimateTax(deriveTaxInput(profile, transactions));
  return NextResponse.json(estimation);
}
