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

// ─── Seed Data ───────────────────────────────────────────────────────────────

export function getCategorizedTransactions(): Transaction[] {
  const raw: Omit<Transaction, 'category' | 'aiCategorized'>[] = [
    { id: 'tx_1', userId: 'user_123', amount: 25000, description: 'Monthly Apartment Rent', merchant: 'Landlord Transfer', date: '2026-07-01', isRecurring: true },
    { id: 'tx_2', userId: 'user_123', amount: 1200, description: 'Swiggy Order', merchant: 'Swiggy', date: '2026-07-06', isRecurring: false },
    { id: 'tx_3', userId: 'user_123', amount: 4500, description: 'Dinner at Olive Bistro', merchant: 'Olive Bistro', date: '2026-07-08', isRecurring: false },
    { id: 'tx_4', userId: 'user_123', amount: 800,  description: 'Uber Ride to Office', merchant: 'Uber', date: '2026-07-10', isRecurring: false },
    { id: 'tx_5', userId: 'user_123', amount: 3500, description: 'BESCOM Electricity Bill', merchant: 'BESCOM', date: '2026-07-05', isRecurring: true },
    { id: 'tx_6', userId: 'user_123', amount: 5500, description: 'Monthly Groceries', merchant: 'BigBasket', date: '2026-07-12', isRecurring: false },
    { id: 'tx_7', userId: 'user_123', amount: 10000, description: 'Mutual Fund SIP — Axis Bluechip', merchant: 'Zerodha', date: '2026-07-15', isRecurring: true },
    { id: 'tx_8', userId: 'user_123', amount: 1500, description: 'Netflix Subscription', merchant: 'Netflix', date: '2026-07-15', isRecurring: true },
    { id: 'tx_9', userId: 'user_123', amount: 999,  description: 'Airtel Postpaid Bill', merchant: 'Airtel', date: '2026-07-16', isRecurring: true },
    { id: 'tx_10', userId: 'user_123', amount: 950, description: 'Zomato Order', merchant: 'Zomato', date: '2026-07-18', isRecurring: false },
    { id: 'tx_11', userId: 'user_123', amount: 2200, description: 'Rapido Bike Rides', merchant: 'Rapido', date: '2026-07-19', isRecurring: false },
    { id: 'tx_12', userId: 'user_123', amount: 1800, description: 'BookMyShow — Movie tickets', merchant: 'BookMyShow', date: '2026-07-20', isRecurring: false },
  ];

  return raw.map((tx) => ({
    ...tx,
    category: categorizeTransaction(tx.description, tx.merchant),
    aiCategorized: true,
  }));
}

// ─── Budget Analysis ─────────────────────────────────────────────────────────

export function analyzeBudget(transactions: Transaction[]): SpendingSummary {
  const MONTHLY_BUDGET = 65000;

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
