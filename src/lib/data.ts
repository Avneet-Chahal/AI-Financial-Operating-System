/**
 * User-scoped data access.
 *
 * All reads here are keyed by the authenticated user id so a user can only ever
 * see their own financial data. Prisma rows are mapped onto the existing app
 * types (src/types) so the agents and UI stay unchanged.
 */
import type { Transaction, UserProfile, Category } from '@/types';
import { prisma } from './prisma';
import { auth } from './auth';

/**
 * Resolve the authenticated user id from the session, or null if signed out.
 * This is the single source of identity — no route ever trusts a client-supplied id.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Map a Prisma User row onto the app UserProfile type. */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return null;
  return {
    id: u.id,
    name: u.name ?? 'there',
    email: u.email,
    monthlyIncome: u.monthlyIncome,
    currency: u.currency,
    riskTolerance: u.riskTolerance,
    createdAt: u.createdAt.toISOString(),
  };
}

/** Load a user's transactions, newest first, mapped onto the app Transaction type. */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  return rows.map((tx) => ({
    id: tx.id,
    userId: tx.userId,
    amount: tx.amount,
    category: tx.category as Category,
    description: tx.description,
    merchant: tx.merchant,
    date: tx.date.toISOString().slice(0, 10),
    isRecurring: tx.isRecurring,
    aiCategorized: tx.aiCategorized,
    flaggedSuspicious: tx.flaggedSuspicious,
  }));
}

/**
 * Personalized monthly budget. If the user has set an income we target 75% of it
 * (a 25% savings goal); otherwise fall back to a sensible default so the UI still
 * renders for brand-new accounts.
 */
export function deriveMonthlyBudget(profile: UserProfile | null): number {
  if (profile && profile.monthlyIncome > 0) {
    return Math.round(profile.monthlyIncome * 0.75);
  }
  return 65000;
}
