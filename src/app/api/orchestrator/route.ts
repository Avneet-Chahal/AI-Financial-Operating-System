import { NextResponse } from 'next/server';
import { OrchestratorSummary } from '@/types';

/**
 * Placeholder API Route for AI Orchestrator
 */
export async function GET() {
  const sampleData: OrchestratorSummary = {
    id: 'orch_001',
    userId: 'user_123',
    timestamp: new Date().toISOString(),
    plainLanguageOverview: 'You spent 15% more on dining out this month, but your savings rate remains healthy at 28%.',
    keyInsights: [
      'Food & Dining spending reached ₹18,500 (+₹3,200 vs last month)',
      'Tax saving deduction under 80C has ₹45,000 remaining headroom before March 31'
    ],
    primaryRecommendation: {
      id: 'rec_80c',
      title: 'Invest ₹45,000 in ELSS Mutual Funds',
      description: 'You can save up to ₹14,040 in tax by utilizing your remaining Section 80C limit.',
      impactScore: 9,
      sourceAgent: 'TAX',
    },
    agentStatus: {
      SPENDING: 'ACTIVE',
      INVESTMENT: 'ACTIVE',
      TAX: 'ACTIVE',
      LOAN: 'IDLE',
      FRAUD: 'ACTIVE',
      GOAL_PLANNING: 'IDLE',
      ECONOMIC_INTELLIGENCE: 'IDLE'
    }
  };

  return NextResponse.json(sampleData);
}
