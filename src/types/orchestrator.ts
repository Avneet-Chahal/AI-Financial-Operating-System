/**
 * AI Orchestrator & Multi-Agent Data Shape
 */
export type AgentType = 
  | 'SPENDING'
  | 'INVESTMENT'
  | 'TAX'
  | 'LOAN'
  | 'FRAUD'
  | 'GOAL_PLANNING'
  | 'ECONOMIC_INTELLIGENCE';

export interface ActionableRecommendation {
  id: string;
  title: string;
  description: string;
  impactScore: number; // 1-10 priority/financial savings rating
  sourceAgent: AgentType;
  actionUrl?: string;
}

export interface OrchestratorSummary {
  id: string;
  userId: string;
  timestamp: string;
  plainLanguageOverview: string;
  keyInsights: string[];
  primaryRecommendation: ActionableRecommendation;
  agentStatus: Record<AgentType, 'ACTIVE' | 'IDLE' | 'ERROR'>;
}
