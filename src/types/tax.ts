/**
 * Tax Agent Data Shape
 */
export interface TaxDeduction {
  section: '80C' | '80D' | '80CCD' | 'HRA' | 'STANDARD';
  limit: number;
  utilized: number;
  remaining: number;
}

export interface TaxEstimation {
  taxableIncome: number;
  estimatedTaxOldRegime: number;
  estimatedTaxNewRegime: number;
  recommendedRegime: 'OLD' | 'NEW';
  deductions: TaxDeduction[];
}
