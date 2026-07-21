import { NextResponse } from 'next/server';
import { mockSpendingSummary } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockSpendingSummary);
}
