/**
 * LangChain Orchestrator API — GET /api/orchestrator
 *
 * Runs the full LangChain orchestration pipeline:
 *  1. Tool calling (Spending, Investment, Tax agents)
 *  2. RAG context assembly
 *  3. Memory check (60-second cache)
 *  4. Synthesis → OrchestratorSummary
 */
import { NextResponse } from 'next/server';
import type { OrchestratorSummary } from '@/types';
import { runOrchestrator } from '@/lib/langchain-orchestrator';

export async function GET(): Promise<NextResponse<OrchestratorSummary>> {
  const summary = await runOrchestrator();
  return NextResponse.json(summary);
}
