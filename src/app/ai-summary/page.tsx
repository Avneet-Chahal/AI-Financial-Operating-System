import React from 'react';
import OrchestratorWidget from '@/components/dashboard/OrchestratorWidget';

/**
 * Route: /ai-summary (AI Orchestrator - v1 MUST)
 */
export default function AISummaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">AI Orchestrator & Recommendations</h1>
        <p className="text-sm text-slate-400">Plain-language summaries and action items synthesized across agents.</p>
      </div>

      <OrchestratorWidget />
    </div>
  );
}
