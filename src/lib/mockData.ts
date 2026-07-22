import { UserProfile } from '@/types';

/**
 * Static seed data — only user profile and historical monthly trend remain.
 * All financial data (transactions, spending summary, orchestrator output)
 * is now served live by the agent modules and LangChain Orchestration Layer.
 */

export const mockUser: UserProfile = {
  id: 'user_123',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  monthlyIncome: 85000,
  currency: 'INR',
  riskTolerance: 'MEDIUM',
  createdAt: '2025-01-01',
};

export const mockMonthlyTrend = [
  { month: 'Feb', amount: 41000 },
  { month: 'Mar', amount: 45000 },
  { month: 'Apr', amount: 39000 },
  { month: 'May', amount: 42500 },
  { month: 'Jun', amount: 40000 },
  { month: 'Jul', amount: 42800 },
];
