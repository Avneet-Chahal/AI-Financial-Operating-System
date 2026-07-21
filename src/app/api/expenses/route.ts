import { NextResponse } from 'next/server';
import { mockTransactions } from '@/lib/mockData';
import { Category } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as Category | null;
  
  let transactions = [...mockTransactions];
  
  if (category) {
    transactions = transactions.filter(tx => tx.category === category);
  }
  
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  const data = await request.json();
  // In a real app, save to database
  
  return NextResponse.json({ 
    success: true, 
    transaction: data 
  }, { status: 201 });
}
