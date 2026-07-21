import React from 'react';
import OrchestratorWidget from '@/components/dashboard/OrchestratorWidget';
import FinancialHealthScore from '@/components/dashboard/FinancialHealthScore';
import SpendingOverview from '@/components/dashboard/SpendingOverview';
import QuickStats from '@/components/dashboard/QuickStats';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

import { 
  mockUser, 
  mockOrchestratorSummary, 
  mockSpendingSummary,
  mockMonthlyTrend,
  mockTransactions
} from '@/lib/mockData';

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Good morning, {mockUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here is your financial briefing for {currentDate}.</p>
        </div>
      </div>

      {/* Row 1: AI Orchestrator */}
      <OrchestratorWidget summary={mockOrchestratorSummary} />

      {/* Row 2: Quick Stats Grid */}
      <QuickStats user={mockUser} summary={mockSpendingSummary} />

      {/* Row 3: Health Score & Spending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FinancialHealthScore score={88} />
        </div>
        <div className="lg:col-span-2">
          <SpendingOverview user={mockUser} summary={mockSpendingSummary} />
        </div>
      </div>

      {/* Row 4: Categories & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown summary={mockSpendingSummary} />
        <RecentTransactions transactions={mockTransactions} />
      </div>

      {/* Row 5: Monthly Trend */}
      <div className="w-full">
        <MonthlyTrend data={mockMonthlyTrend} />
      </div>
    </div>
  );
}
