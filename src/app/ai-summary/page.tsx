'use client';

import React, { useState } from 'react';
import AgentStatusGrid from '@/components/ai/AgentStatusGrid';
import PlainLanguageSummary from '@/components/ai/PlainLanguageSummary';
import RecommendationCard from '@/components/ai/RecommendationCard';
import InsightsList from '@/components/ai/InsightsList';
import { mockOrchestratorSummary } from '@/lib/mockData';
import { RefreshCw, Zap } from 'lucide-react';

export default function AISummaryPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000); // Simulate network request
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            AI Orchestrator
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded border border-indigo-500/20 font-medium">
              V1 Core Engine
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Plain-language summaries and action items synthesized across agents.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          {isRefreshing ? 'Synthesizing...' : 'Regenerate Summary'}
        </button>
      </div>

      {/* Top: Agent Status Grid */}
      <div className="animate-slide-up">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Agent Network Status</h3>
        <AgentStatusGrid status={mockOrchestratorSummary.agentStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Summary */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h3>
            <PlainLanguageSummary 
              text={mockOrchestratorSummary.plainLanguageOverview} 
              timestamp={mockOrchestratorSummary.timestamp} 
            />
          </div>

          {/* Primary Recommendation */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <RecommendationCard recommendation={mockOrchestratorSummary.primaryRecommendation} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Key Insights List */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key Insights</h3>
            </div>
            <InsightsList insights={mockOrchestratorSummary.keyInsights} />
          </div>
          
          {/* Placeholder for future individual agent insights */}
          <div className="glass-card p-5 rounded-2xl border-dashed border-slate-700 opacity-70 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Spending Agent Drill-down</h3>
            <p className="text-xs text-slate-500">Detailed category-wise anomaly detection available in the Spending Agent module.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
