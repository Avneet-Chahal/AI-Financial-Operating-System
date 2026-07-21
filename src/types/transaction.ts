/**
 * Expense & Transaction Data Shape (Spending Agent)
 */
export type Category = 
  | 'HOUSING'
  | 'FOOD_DINING'
  | 'TRANSPORTATION'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'INVESTMENTS'
  | 'MISCELLANEOUS';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: Category;
  description: string;
  merchant: string;
  date: string;
  isRecurring: boolean;
  aiCategorized: boolean;
  flaggedSuspicious?: boolean;
}

export interface SpendingSummary {
  totalSpent: number;
  monthlyBudget: number;
  topCategory: Category;
  categoryBreakdown: Record<Category, number>;
  forecastedNextMonth: number;
}
