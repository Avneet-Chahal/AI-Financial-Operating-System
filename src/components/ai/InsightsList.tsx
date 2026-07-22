import React from 'react';
import { Sparkles } from 'lucide-react';

export default function InsightsList({ insights }: { insights: string[] }) {
  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="glass-card p-4 rounded-xl flex items-start gap-3 animate-slide-up group hover:bg-slate-800/40 transition-colors border-l-2 border-l-indigo-500"
          style={{ animationDelay: `${300 + i * 100}ms` }}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="flex-1 min-w-0 break-words text-sm text-slate-300 leading-relaxed pt-1 font-medium">
            {insight}
          </p>
        </div>
      ))}
    </div>
  );
}
