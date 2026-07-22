/**
 * Spending Agent — Core Logic (MUST tier)
 *
 * Responsibilities:
 *  - Rule-based auto-categorization of raw transaction descriptions/merchants.
 *  - Budget analysis: total spent, top category, per-category breakdown.
 *  - Simple next-month forecast derived from the current period.
 *
 * This module is the primary data source for the LangChain Orchestration Layer.
 */

import type { Category, SpendingSummary, Transaction } from '@/types';

// ─── Categorization Rules ────────────────────────────────────────────────────

const CATEGORY_RULES: Record<Category, string[]> = {
  HOUSING: ['rent', 'landlord', 'housing', 'pg', 'apartment', 'lease', 'maintenance society'],
  FOOD_DINING: ['swiggy', 'zomato', 'restaurant', 'cafe', 'bistro', 'bigbasket', 'grofers', 'blinkit', 'dunzo', 'food', 'dining', 'pizza', 'burger', 'chai', 'dhaba'],
  TRANSPORTATION: ['uber', 'ola', 'rapido', 'metro', 'bus', 'petrol', 'fuel', 'parking', 'toll', 'namma metro', 'auto'],
  ENTERTAINMENT: ['netflix', 'spotify', 'hotstar', 'prime', 'youtube', 'gaming', 'movie', 'concert', 'bookmyshow', 'zee5', 'sony liv'],
  UTILITIES: ['electricity', 'bescom', 'tata power', 'adani electric', 'water', 'gas', 'internet', 'airtel', 'jio', 'bsnl', 'broadband', 'mobile recharge'],
  INVESTMENTS: ['zerodha', 'groww', 'kuvera', 'mutual fund', 'sip', 'nps', 'ppf', 'elss', 'stocks', 'fd', 'fixed deposit', 'gold bond', 'rbi bond'],
  MISCELLANEOUS: [],
};

export function categorizeTransaction(description: string, merchant: string): Category {
  const text = `${description} ${merchant}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_RULES) as [Category, string[]][]) {
    if (category === 'MISCELLANEOUS') continue;
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }
  return 'MISCELLANEOUS';
}

// ─── Budget Analysis ─────────────────────────────────────────────────────────

const DEFAULT_MONTHLY_BUDGET = 65000;

/**
 * Analyze a user's transactions into a SpendingSummary.
 * @param transactions  The user's own transactions (loaded from the database).
 * @param monthlyBudget Optional personalized budget; defaults to a sensible value
 *                      so the UI still renders for accounts without an income set.
 */
export function analyzeBudget(
  transactions: Transaction[],
  monthlyBudget: number = DEFAULT_MONTHLY_BUDGET
): SpendingSummary {
  const MONTHLY_BUDGET = monthlyBudget > 0 ? monthlyBudget : DEFAULT_MONTHLY_BUDGET;

  // Category breakdown
  const breakdown = Object.keys(CATEGORY_RULES).reduce((acc, cat) => {
    acc[cat as Category] = 0;
    return acc;
  }, {} as Record<Category, number>);

  for (const tx of transactions) {
    breakdown[tx.category] = (breakdown[tx.category] ?? 0) + tx.amount;
  }

  const totalSpent = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  // Top category (excluding INVESTMENTS and MISCELLANEOUS for meaningful insight)
  const spendingCategories = (Object.entries(breakdown) as [Category, number][])
    .filter(([cat]) => cat !== 'INVESTMENTS')
    .sort(([, a], [, b]) => b - a);
  const topCategory: Category = spendingCategories[0]?.[0] ?? 'MISCELLANEOUS';

  // Forecast: recurring transactions repeat fully; one-offs at 95%
  const forecastedNextMonth = transactions.reduce((sum, tx) => {
    return sum + (tx.isRecurring ? tx.amount : Math.round(tx.amount * 0.95));
  }, 0);

  return {
    totalSpent,
    monthlyBudget: MONTHLY_BUDGET,
    topCategory,
    categoryBreakdown: breakdown,
    forecastedNextMonth,
  };
}
