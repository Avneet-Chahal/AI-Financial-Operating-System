/**
 * Spending Agent API — /api/expenses
 *
 * GET  → the authenticated user's categorized transactions + SpendingSummary.
 * POST → persist a single manually-added transaction for the authenticated user.
 *
 * All data is scoped to the session user; no client-supplied userId is trusted.
 * Feeds the LangChain Orchestration Layer.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { SpendingSummary, Transaction, Category } from '@/types';
import { analyzeBudget, categorizeTransaction } from '@/lib/spending-agent';
import { prisma } from '@/lib/prisma';
import { clearMemory } from '@/lib/langchain-orchestrator';
import {
  getCurrentUserId,
  getUserProfile,
  getUserTransactions,
  deriveMonthlyBudget,
} from '@/lib/data';

export interface ExpensesResponse {
  transactions: Transaction[];
  summary: SpendingSummary;
}

const CATEGORIES = [
  'HOUSING', 'FOOD_DINING', 'TRANSPORTATION', 'ENTERTAINMENT',
  'UTILITIES', 'INVESTMENTS', 'MISCELLANEOUS',
] as const;

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get('category');

  const [allTransactions, profile] = await Promise.all([
    getUserTransactions(userId),
    getUserProfile(userId),
  ]);
  const summary = analyzeBudget(allTransactions, deriveMonthlyBudget(profile));

  const transactions = categoryFilter
    ? allTransactions.filter((tx) => tx.category === (categoryFilter as Category))
    : allTransactions;

  return NextResponse.json<ExpensesResponse>({ transactions, summary });
}

const createSchema = z.object({
  amount: z.coerce.number().positive(),
  merchant: z.string().trim().min(1).max(120),
  description: z.string().trim().max(240).optional().default(''),
  category: z.enum(CATEGORIES).optional(),
  date: z.string().refine((d) => !Number.isNaN(Date.parse(d)), 'Invalid date'),
  isRecurring: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { amount, merchant, description, date, isRecurring } = parsed.data;
  // Auto-categorize when the client didn't pick a category (Spending Agent rules).
  const category = parsed.data.category ?? categorizeTransaction(description, merchant);

  const row = await prisma.transaction.create({
    data: {
      userId,
      amount: Math.round(amount),
      merchant,
      description,
      category,
      date: new Date(date),
      isRecurring,
      aiCategorized: !parsed.data.category,
      source: 'MANUAL',
    },
  });

  const transaction: Transaction = {
    id: row.id,
    userId: row.userId,
    amount: row.amount,
    category: row.category as Category,
    description: row.description,
    merchant: row.merchant,
    date: row.date.toISOString().slice(0, 10),
    isRecurring: row.isRecurring,
    aiCategorized: row.aiCategorized,
    flaggedSuspicious: row.flaggedSuspicious,
  };

  // New data invalidates the cached AI briefing.
  await clearMemory(userId);

  return NextResponse.json({ success: true, transaction }, { status: 201 });
}
