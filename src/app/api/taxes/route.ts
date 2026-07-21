/**
 * Tax Agent API — GET /api/taxes
 *
 * Returns tax estimation from the Tax Agent including old vs new regime
 * comparison, deduction breakdown, and recommended regime.
 */
import { NextResponse } from 'next/server';
import type { TaxEstimation } from '@/types';
import { estimateTax } from '@/lib/tax-agent';

export function GET(): NextResponse<TaxEstimation> {
  const estimation = estimateTax();
  return NextResponse.json(estimation);
}
