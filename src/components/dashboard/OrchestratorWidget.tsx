import React from 'react';

/**
 * Placeholder Component: AI Orchestrator Summary & Recommendation Widget
 */
export default function OrchestratorWidget() {
  return (
    <div className="p-4 rounded-lg border border-indigo-900/50 bg-indigo-950/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-indigo-400">🤖 AI Orchestrator Summary</h3>
        <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded">Active</span>
      </div>
      <p className="text-sm text-slate-300 mt-2">
        &quot;You spent 15% more on dining out this month, but your savings rate remains healthy at 28%.&quot;
      </p>
      <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-800">
        <span className="text-xs font-semibold text-amber-400">Primary Recommendation:</span>
        <p className="text-sm text-slate-200 mt-0.5">Invest ₹45,000 in ELSS Mutual Funds before March 31 to save ₹14,040 in taxes.</p>
      </div>
    </div>
  );
}
