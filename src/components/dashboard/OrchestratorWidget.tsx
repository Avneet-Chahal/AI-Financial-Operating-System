import React from 'react';
import { OrchestratorSummary } from '@/types';
import { Bot, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function OrchestratorWidget({ summary }: { summary: OrchestratorSummary }) {
  return (
    <div className="glass-card gradient-border-ai rounded-2xl p-6 relative overflow-hidden animate-slide-up">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              AI Orchestrator
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Synthesizing data across 7 financial agents</p>
          </div>
        </div>
        
        <Link href="/ai-summary" className="hidden sm:flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors group">
          View Full Analysis
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="mt-6 relative z-10">
        <div className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium">
          <span className="text-indigo-400">"</span>
          <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-indigo-400 animate-typing max-w-full">
            {summary.plainLanguageOverview}
          </span>
          <span className="text-indigo-400">"</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key Insights</div>
          <ul className="space-y-2">
            {summary.keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                {insight}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Primary Recommendation</div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 h-[calc(100%-28px)] flex flex-col justify-between group hover:border-amber-500/40 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-amber-400 text-base">{summary.primaryRecommendation.title}</h4>
                <div className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Impact: {summary.primaryRecommendation.impactScore}/10
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {summary.primaryRecommendation.description}
              </p>
            </div>
            
            <button className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
              Take Action
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <Link href="/ai-summary" className="sm:hidden mt-4 flex items-center justify-center gap-1 text-sm text-indigo-400 py-3 w-full border border-slate-800 rounded-lg">
        View Full Analysis
      </Link>
    </div>
  );
}
