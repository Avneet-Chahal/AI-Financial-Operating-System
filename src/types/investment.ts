/**
 * Investment Agent Data Shape
 */
export interface AssetAllocation {
  equityPercentage: number;
  debtPercentage: number;
  goldPercentage: number;
  cashPercentage: number;
}

export interface PortfolioSummary {
  totalValue: number;
  unrealizedGains: number;
  allocation: AssetAllocation;
  recommendedTaxSavingInvestments: number;
}
