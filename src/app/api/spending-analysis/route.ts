import { NextResponse } from 'next/server';
import { analyzeBudget } from '@/lib/spending-agent';
import {
  getCurrentUserId,
  getUserProfile,
  getUserTransactions,
  deriveMonthlyBudget,
} from '@/lib/data';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [transactions, profile] = await Promise.all([
    getUserTransactions(userId),
    getUserProfile(userId),
  ]);
  const summary = analyzeBudget(transactions, deriveMonthlyBudget(profile));
  return NextResponse.json(summary);
}
