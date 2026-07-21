/**
 * Goal Planning Agent Data Shape
 */
export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentSaved: number;
  targetDate: string;
  category: 'HOUSE' | 'CAR' | 'RETIREMENT' | 'EDUCATION' | 'EMERGENCY';
}
