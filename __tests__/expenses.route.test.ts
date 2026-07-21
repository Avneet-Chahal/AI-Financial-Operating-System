/**
 * Integration test for the Spending Agent API (GET /api/expenses).
 *
 * Invokes the route handler end-to-end and verifies the response body conforms
 * to the SpendingSummary contract from src/types. This is the MUST-tier
 * integration coverage required by CLAUDE.md for the Spending Agent.
 */
import { GET, type ExpensesResponse } from '@/app/api/expenses/route';
import type { Category } from '@/types';

const ALL_CATEGORIES: Category[] = [
  'HOUSING',
  'FOOD_DINING',
  'TRANSPORTATION',
  'ENTERTAINMENT',
  'UTILITIES',
  'INVESTMENTS',
  'MISCELLANEOUS',
];

describe('GET /api/expenses', () => {
  it('returns transactions and a SpendingSummary-shaped payload', async () => {
    const response = GET();
    const body = (await response.json()) as ExpensesResponse;

    // Transactions are present and AI-categorized.
    expect(Array.isArray(body.transactions)).toBe(true);
    expect(body.transactions.length).toBeGreaterThan(0);
    for (const tx of body.transactions) {
      expect(ALL_CATEGORIES).toContain(tx.category);
      expect(tx.aiCategorized).toBe(true);
    }

    // Summary matches the SpendingSummary shape.
    const { summary } = body;
    expect(typeof summary.totalSpent).toBe('number');
    expect(typeof summary.monthlyBudget).toBe('number');
    expect(typeof summary.forecastedNextMonth).toBe('number');
    expect(ALL_CATEGORIES).toContain(summary.topCategory);

    // categoryBreakdown has an entry for every Category.
    for (const category of ALL_CATEGORIES) {
      expect(typeof summary.categoryBreakdown[category]).toBe('number');
    }

    // Breakdown sums to totalSpent (no spend is lost or double-counted).
    const breakdownTotal = ALL_CATEGORIES.reduce(
      (sum, category) => sum + summary.categoryBreakdown[category],
      0,
    );
    expect(breakdownTotal).toBe(summary.totalSpent);
  });

  it('picks HOUSING as the top category for the seed data (rent dominates)', async () => {
    const response = GET();
    const body = (await response.json()) as ExpensesResponse;
    expect(body.summary.topCategory).toBe('HOUSING');
  });
});
