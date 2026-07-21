/**
 * Loan Agent Data Shape
 */
export interface Loan {
  id: string;
  type: 'HOME' | 'CAR' | 'PERSONAL' | 'EDUCATION';
  principal: number;
  remainingAmount: number;
  interestRate: number;
  monthlyEMI: number;
  tenureMonths: number;
  remainingMonths: number;
}
