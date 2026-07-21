import React from 'react';
import OrchestratorWidget from '@/components/dashboard/OrchestratorWidget';
import FinancialHealthScore from '@/components/dashboard/FinancialHealthScore';
import SpendingOverview from '@/components/dashboard/SpendingOverview';
import QuickStats from '@/components/dashboard/QuickStats';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

import { runOrchestrator } from '@/lib/langchain-orchestrator';
import { analyzeBudget, getCategorizedTransactions } from '@/lib/spending-agent';
import { mockUser, mockMonthlyTrend } from '@/lib/mockData';

/**
 * Dashboard — server component.
 * Fetches live data from the LangChain Orchestrator and Spending Agent at render time.
 * mockData is only used for user profile and monthly trend (static seed).
 */
export default async function DashboardPage() {
  // Run agents in parallel
  const [orchestratorSummary, transactions] = await Promise.all([
    runOrchestrator(mockUser.id),
    Promise.resolve(getCategorizedTransactions()),
  ]);

  const spendingSummary = analyzeBudget(transactions);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Compute a simple health score based on budget used + savings rate
  const budgetUsedPct = spendingSummary.totalSpent / spendingSummary.monthlyBudget;
  const savingsRate = 1 - budgetUsedPct;
  const healthScore = Math.min(100, Math.round(50 + savingsRate * 50 + (savingsRate > 0.3 ? 10 : 0)));

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

      {/* Row 1: LangChain AI Orchestrator */}
      <OrchestratorWidget summary={orchestratorSummary} />

      {/* Row 2: Quick Stats Grid */}
      <QuickStats user={mockUser} summary={spendingSummary} />

      {/* Row 3: Health Score & Spending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FinancialHealthScore score={healthScore} />
        </div>
        <div className="lg:col-span-2">
          <SpendingOverview user={mockUser} summary={spendingSummary} />
        </div>
      </div>

      {/* Row 4: Categories & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown summary={spendingSummary} />
        <RecentTransactions transactions={transactions} />
      </div>

      {/* Row 5: Monthly Trend */}
      <div className="w-full">
        <MonthlyTrend data={mockMonthlyTrend} />
      </div>
    </div>
  );
}
