/**
 * LangChain Orchestrator API — GET /api/orchestrator
 *
 * Runs the full LangChain orchestration pipeline for the authenticated user:
 *  1. Tool calling (Spending, Investment, Tax agents) over their real data
 *  2. RAG context assembly
 *  3. Redis-backed memory + summary cache
 *  4. LLM synthesis → OrchestratorSummary
 */
import { NextResponse } from 'next/server';
import type { OrchestratorSummary } from '@/types';
import { runOrchestrator } from '@/lib/langchain-orchestrator';
import { getCurrentUserId } from '@/lib/data';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const summary: OrchestratorSummary = await runOrchestrator(userId);
  return NextResponse.json(summary);
}
