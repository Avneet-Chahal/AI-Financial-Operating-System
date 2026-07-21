import { NextResponse } from 'next/server';
import { mockOrchestratorSummary } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockOrchestratorSummary);
}
