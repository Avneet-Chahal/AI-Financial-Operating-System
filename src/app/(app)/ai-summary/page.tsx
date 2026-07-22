'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AgentStatusGrid from '@/components/ai/AgentStatusGrid';
import PlainLanguageSummary from '@/components/ai/PlainLanguageSummary';
import RecommendationCard from '@/components/ai/RecommendationCard';
import InsightsList from '@/components/ai/InsightsList';
import { RefreshCw, Zap, Link } from 'lucide-react';
import type { OrchestratorSummary } from '@/types';

export default function AISummaryPage() {
  const [summary, setSummary] = useState<OrchestratorSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/orchestrator', { cache: 'no-store' });
      const data: OrchestratorSummary = await res.json();
      setSummary(data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { void fetchSummary(); }, [fetchSummary]);

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            LangChain AI Layer
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded border border-indigo-500/20 font-medium">
              V1 Core Engine
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-agent orchestration — tool calling, RAG context, memory, and synthesis.
          </p>
        </div>
        <button
          onClick={() => void fetchSummary()}
          disabled={isRefreshing}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          {isRefreshing ? 'Orchestrating...' : 'Re-run Orchestration'}
        </button>
      </div>

      {/* LangChain Tools Invoked */}
      {summary.toolsInvoked && summary.toolsInvoked.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-indigo-500/20 flex flex-wrap items-center gap-2 animate-slide-up">
          <Link className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mr-1">Tools Invoked:</span>
          {summary.toolsInvoked.map((tool) => (
            <span
              key={tool}
              className="text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded-full font-mono"
            >
              {tool.toLowerCase()}_agent
            </span>
          ))}
        </div>
      )}

      {/* Agent Status Grid */}
      <div className="animate-slide-up">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Agent Network Status</h3>
        <AgentStatusGrid status={summary.agentStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Summary */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h3>
            <PlainLanguageSummary text={summary.plainLanguageOverview} timestamp={summary.timestamp} />
          </div>

          {/* Primary Recommendation */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <RecommendationCard recommendation={summary.primaryRecommendation} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Key Insights */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key Insights</h3>
            </div>
            <InsightsList insights={summary.keyInsights} />
          </div>

          {/* Spending Agent Drill-down link */}
          <div className="glass-card p-5 rounded-2xl border-dashed border-slate-700 opacity-70 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Spending Agent Drill-down</h3>
            <p className="text-xs text-slate-500">Detailed category-wise analysis available in the Expenses module.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
