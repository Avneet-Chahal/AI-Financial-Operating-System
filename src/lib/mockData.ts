import { 
  Transaction, 
  UserProfile, 
  OrchestratorSummary, 
  SpendingSummary 
} from '@/types';

export const mockUser: UserProfile = {
  id: 'user_123',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  monthlyIncome: 85000,
  currency: 'INR',
  riskTolerance: 'MEDIUM',
  createdAt: '2025-01-01',
};

export const mockTransactions: Transaction[] = [
  { id: 'tx_1', userId: 'user_123', amount: 25000, category: 'HOUSING', description: 'Monthly Rent', merchant: 'Landlord Transfer', date: '2026-07-01', isRecurring: true, aiCategorized: true },
  { id: 'tx_2', userId: 'user_123', amount: 85000, category: 'MISCELLANEOUS', description: 'Salary', merchant: 'Acme Corp', date: '2026-07-01', isRecurring: true, aiCategorized: true },
  { id: 'tx_3', userId: 'user_123', amount: 3500, category: 'UTILITIES', description: 'Electricity Bill', merchant: 'BESCOM', date: '2026-07-05', isRecurring: true, aiCategorized: true },
  { id: 'tx_4', userId: 'user_123', amount: 1200, category: 'FOOD_DINING', description: 'Swiggy Order', merchant: 'Swiggy', date: '2026-07-06', isRecurring: false, aiCategorized: true },
  { id: 'tx_5', userId: 'user_123', amount: 4500, category: 'FOOD_DINING', description: 'Dinner', merchant: 'Olive Bistro', date: '2026-07-08', isRecurring: false, aiCategorized: true },
  { id: 'tx_6', userId: 'user_123', amount: 800, category: 'TRANSPORTATION', description: 'Uber Ride', merchant: 'Uber', date: '2026-07-10', isRecurring: false, aiCategorized: true },
  { id: 'tx_7', userId: 'user_123', amount: 5500, category: 'FOOD_DINING', description: 'Groceries', merchant: 'BigBasket', date: '2026-07-12', isRecurring: false, aiCategorized: true },
  { id: 'tx_8', userId: 'user_123', amount: 1500, category: 'ENTERTAINMENT', description: 'Netflix Subscription', merchant: 'Netflix', date: '2026-07-15', isRecurring: true, aiCategorized: true },
  { id: 'tx_9', userId: 'user_123', amount: 10000, category: 'INVESTMENTS', description: 'Mutual Fund SIP', merchant: 'Zerodha', date: '2026-07-15', isRecurring: true, aiCategorized: true },
  { id: 'tx_10', userId: 'user_123', amount: 950, category: 'FOOD_DINING', description: 'Zomato Order', merchant: 'Zomato', date: '2026-07-18', isRecurring: false, aiCategorized: true },
];

export const mockSpendingSummary: SpendingSummary = {
  totalSpent: 42800,
  monthlyBudget: 65000,
  topCategory: 'HOUSING',
  categoryBreakdown: {
    HOUSING: 25000,
    FOOD_DINING: 12150,
    TRANSPORTATION: 800,
    ENTERTAINMENT: 1500,
    UTILITIES: 3500,
    INVESTMENTS: 10000,
    MISCELLANEOUS: 0,
  },
  forecastedNextMonth: 44000,
};

export const mockOrchestratorSummary: OrchestratorSummary = {
  id: 'orch_001',
  userId: 'user_123',
  timestamp: new Date().toISOString(),
  plainLanguageOverview: 'You spent 15% more on dining out this month, but your savings rate remains healthy at 37%.',
  keyInsights: [
    'Food & Dining spending reached ₹12,150 (+₹2,100 vs last month)',
    'Tax saving deduction under 80C has ₹45,000 remaining headroom before March 31'
  ],
  primaryRecommendation: {
    id: 'rec_80c',
    title: 'Invest ₹45,000 in ELSS Mutual Funds',
    description: 'You can save up to ₹14,040 in tax by utilizing your remaining Section 80C limit before the financial year ends.',
    impactScore: 9,
    sourceAgent: 'TAX',
  },
  agentStatus: {
    SPENDING: 'ACTIVE',
    INVESTMENT: 'ACTIVE',
    TAX: 'ACTIVE',
    LOAN: 'IDLE',
    FRAUD: 'ACTIVE',
    GOAL_PLANNING: 'IDLE',
    ECONOMIC_INTELLIGENCE: 'IDLE'
  }
};

export const mockMonthlyTrend = [
  { month: 'Feb', amount: 41000 },
  { month: 'Mar', amount: 45000 },
  { month: 'Apr', amount: 39000 },
  { month: 'May', amount: 42500 },
  { month: 'Jun', amount: 40000 },
  { month: 'Jul', amount: 42800 },
];
