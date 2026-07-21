import React from 'react';
import { OrchestratorSummary } from '@/types';
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RecommendationCard({ recommendation }: { recommendation: OrchestratorSummary['primaryRecommendation'] }) {
  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden animate-slide-up shadow-xl shadow-amber-500/5">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/20">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              Primary Recommendation
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md">
              Source: <span className="text-slate-300 font-medium">{recommendation.sourceAgent} AGENT</span>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">{recommendation.title}</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            {recommendation.description}
          </p>
          
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Impact Score: {recommendation.impactScore}/10</span>
          </div>
        </div>
        
        <div className="shrink-0">
          <button className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group hover:scale-105 active:scale-95">
            Take Action
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
