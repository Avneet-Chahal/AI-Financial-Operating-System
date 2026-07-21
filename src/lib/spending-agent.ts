/**
 * Spending Agent — core logic (Track A / MUST tier)
 *
 * Responsibilities:
 *  - Rule-based auto-categorization of raw transaction descriptions/merchants.
 *  - Budget analysis: total spent, top category, per-category breakdown.
 *  - A simple next-month forecast derived from the current period.
 *
 * No database yet — transactions are seeded in-memory. The AI Orchestrator
 * (Track B) will later consume the SpendingSummary produced here.
 */
import type { Category, Transaction, SpendingSummary } from '@/types';

/**
 * Monthly budget for the demo persona (Priya). Hardcoded until user profiles
 * are backed by a database. All amounts are in INR (₹).
 */
export const MONTHLY_BUDGET = 60000;

/**
 * Ordered keyword rules mapping merchant/description tokens to a Category.
 * Evaluated top-to-bottom; first match wins, so more specific merchants
 * should appear before broad fallbacks.
 */
interface CategoryRule {
  category: Category;
  keywords: string[];
}

const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    category: 'HOUSING',
    keywords: ['rent', 'landlord', 'apartment', 'maintenance', 'society', 'hoa', 'mortgage'],
  },
  {
    category: 'FOOD_DINING',
    keywords: [
      'swiggy',
      'zomato',
      'restaurant',
      'bistro',
      'cafe',
      'dominos',
      'starbucks',
      'grocery',
      'bigbasket',
      'blinkit',
      'zepto',
      'dining',
      'dinner',
      'lunch',
    ],
  },
  {
    category: 'TRANSPORTATION',
    keywords: ['uber', 'ola', 'rapido', 'fuel', 'petrol', 'diesel', 'metro', 'irctc', 'cab', 'ride'],
  },
  {
    category: 'ENTERTAINMENT',
    keywords: ['netflix', 'spotify', 'hotstar', 'prime video', 'bookmyshow', 'pvr', 'movie', 'game'],
  },
  {
    category: 'UTILITIES',
    keywords: [
      'electricity',
      'water bill',
      'gas bill',
      'broadband',
      'airtel',
      'jio',
      'vodafone',
      'recharge',
      'internet',
      'bill',
    ],
  },
  {
    category: 'INVESTMENTS',
    keywords: ['sip', 'mutual fund', 'elss', 'zerodha', 'groww', 'stocks', 'nps', 'ppf', 'ppf deposit'],
  },
];

/**
 * Assigns a Category to a transaction based on its description and merchant.
 * Falls back to MISCELLANEOUS when no keyword rule matches.
 */
export function categorizeTransaction(description: string, merchant: string): Category {
  const haystack = `${description} ${merchant}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return 'MISCELLANEOUS';
}

/**
 * A transaction before categorization — the raw shape we would receive from a
 * bank/UPI feed. `category`/`aiCategorized` are derived by the agent.
 */
export type RawTransaction = Omit<Transaction, 'category' | 'aiCategorized'>;

/**
 * Hardcoded sample Indian transactions for the demo persona. Represents a
 * typical salaried professional's month (rent, food delivery, cabs, bills,
 * shopping, investments).
 */
const SEED_TRANSACTIONS: readonly RawTransaction[] = [
  {
    id: 'tx_1',
    userId: 'user_123',
    amount: 25000,
    description: 'Monthly Apartment Rent',
    merchant: 'Landlord Transfer',
    date: '2026-07-01',
    isRecurring: true,
  },
  {
    id: 'tx_2',
    userId: 'user_123',
    amount: 640,
    description: 'Food delivery order',
    merchant: 'Swiggy',
    date: '2026-07-03',
    isRecurring: false,
  },
  {
    id: 'tx_3',
    userId: 'user_123',
    amount: 1200,
    description: 'Uber Ride to Airport',
    merchant: 'Uber',
    date: '2026-07-05',
    isRecurring: false,
  },
  {
    id: 'tx_4',
    userId: 'user_123',
    amount: 2340,
    description: 'Online shopping order',
    merchant: 'Amazon',
    date: '2026-07-07',
    isRecurring: false,
  },
  {
    id: 'tx_5',
    userId: 'user_123',
    amount: 1850,
    description: 'Monthly electricity bill',
    merchant: 'BESCOM Electricity',
    date: '2026-07-08',
    isRecurring: true,
  },
  {
    id: 'tx_6',
    userId: 'user_123',
    amount: 3200,
    description: 'Weekly grocery run',
    merchant: 'BigBasket',
    date: '2026-07-10',
    isRecurring: false,
  },
  {
    id: 'tx_7',
    userId: 'user_123',
    amount: 5000,
    description: 'Monthly SIP investment',
    merchant: 'Groww Mutual Fund',
    date: '2026-07-11',
    isRecurring: true,
  },
  {
    id: 'tx_8',
    userId: 'user_123',
    amount: 649,
    description: 'Netflix subscription',
    merchant: 'Netflix',
    date: '2026-07-12',
    isRecurring: true,
  },
  {
    id: 'tx_9',
    userId: 'user_123',
    amount: 799,
    description: 'Mobile & broadband recharge',
    merchant: 'Airtel',
    date: '2026-07-14',
    isRecurring: true,
  },
  {
    id: 'tx_10',
    userId: 'user_123',
    amount: 4500,
    description: 'Dinner at Olive Bistro',
    merchant: 'Olive Bistro',
    date: '2026-07-18',
    isRecurring: false,
  },
];

/**
 * Returns the seeded transactions with an AI-assigned category. This is what a
 * real feed + categorization pass would produce.
 */
export function getCategorizedTransactions(): Transaction[] {
  return SEED_TRANSACTIONS.map((raw) => ({
    ...raw,
    category: categorizeTransaction(raw.description, raw.merchant),
    aiCategorized: true,
  }));
}

/** Every Category initialized to zero — used as the breakdown accumulator. */
function emptyBreakdown(): Record<Category, number> {
  return {
    HOUSING: 0,
    FOOD_DINING: 0,
    TRANSPORTATION: 0,
    ENTERTAINMENT: 0,
    UTILITIES: 0,
    INVESTMENTS: 0,
    MISCELLANEOUS: 0,
  };
}

/**
 * Computes a SpendingSummary from categorized transactions: total spent, the
 * highest-spend category, a per-category breakdown, and a naive forecast.
 *
 * Forecast heuristic: recurring transactions are assumed to repeat next month,
 * while one-off spending is projected forward at 90% (a mild regression toward
 * the mean). This is intentionally simple until the ML forecaster lands.
 */
export function analyzeBudget(
  transactions: Transaction[],
  monthlyBudget: number = MONTHLY_BUDGET,
): SpendingSummary {
  const categoryBreakdown = emptyBreakdown();
  let totalSpent = 0;
  let recurringSpend = 0;
  let oneOffSpend = 0;

  for (const tx of transactions) {
    categoryBreakdown[tx.category] += tx.amount;
    totalSpent += tx.amount;
    if (tx.isRecurring) {
      recurringSpend += tx.amount;
    } else {
      oneOffSpend += tx.amount;
    }
  }

  const topCategory = (Object.keys(categoryBreakdown) as Category[]).reduce(
    (top, category) => (categoryBreakdown[category] > categoryBreakdown[top] ? category : top),
    'MISCELLANEOUS' as Category,
  );

  const forecastedNextMonth = Math.round(recurringSpend + oneOffSpend * 0.9);

  return {
    totalSpent,
    monthlyBudget,
    topCategory,
    categoryBreakdown,
    forecastedNextMonth,
  };
}
