import React from 'react';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import SpendingSummaryCard from '@/components/dashboard/SpendingSummaryCard';
import OrchestratorWidget from '@/components/dashboard/OrchestratorWidget';

/**
 * Route: / (Unified Dashboard - v1 MUST)
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Financial Dashboard</h1>
        <p className="text-sm text-slate-400">Unified overview powered by AI-FOS agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NetWorthCard />
        <SpendingSummaryCard />
      </div>

      <OrchestratorWidget />
    </div>
  );
}
