/**
 * User & Authentication Data Shape
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}
