import { NextResponse } from 'next/server';
import { Transaction } from '@/types';

/**
 * Placeholder API Route for Expense Tracking (Spending Agent)
 */
export async function GET() {
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: 'user_123',
      amount: 4500,
      category: 'FOOD_DINING',
      description: 'Dinner at Olive Bistro',
      merchant: 'Olive Bistro',
      date: '2026-07-18',
      isRecurring: false,
      aiCategorized: true
    },
    {
      id: 'tx_2',
      userId: 'user_123',
      amount: 25000,
      category: 'HOUSING',
      description: 'Monthly Apartment Rent',
      merchant: 'Landlord Transfer',
      date: '2026-07-01',
      isRecurring: true,
      aiCategorized: true
    },
    {
      id: 'tx_3',
      userId: 'user_123',
      amount: 1200,
      category: 'TRANSPORTATION',
      description: 'Uber Ride to Airport',
      merchant: 'Uber',
      date: '2026-07-15',
      isRecurring: false,
      aiCategorized: true
    }
  ];

  return NextResponse.json({ transactions: sampleTransactions });
}
