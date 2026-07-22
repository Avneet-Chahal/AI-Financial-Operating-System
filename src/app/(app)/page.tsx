import React from 'react';
import { redirect } from 'next/navigation';
import OrchestratorWidget from '@/components/dashboard/OrchestratorWidget';
import FinancialHealthScore from '@/components/dashboard/FinancialHealthScore';
import SpendingOverview from '@/components/dashboard/SpendingOverview';
import QuickStats from '@/components/dashboard/QuickStats';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import StatementUpload from '@/components/dashboard/StatementUpload';

import { runOrchestrator } from '@/lib/langchain-orchestrator';
import { isLlmConfigured } from '@/lib/llm';
import { analyzeBudget } from '@/lib/spending-agent';
import {
  getCurrentUserId,
  getUserProfile,
  getUserTransactions,
  deriveMonthlyBudget,
} from '@/lib/data';
import { mockMonthlyTrend } from '@/lib/mockData';
import type { UserProfile } from '@/types';

/**
 * Dashboard — server component.
 * Loads the signed-in user's real profile + transactions from the database, then
 * runs the Spending Agent and LangChain Orchestrator over that data at render time.
 */
export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const [profile, transactions] = await Promise.all([
    getUserProfile(userId),
    getUserTransactions(userId),
  ]);

  const user: UserProfile = profile ?? {
    id: userId,
    name: 'there',
    email: '',
    monthlyIncome: 0,
    currency: 'INR',
    riskTolerance: 'MEDIUM',
    createdAt: new Date().toISOString(),
  };

  const spendingSummary = analyzeBudget(transactions, deriveMonthlyBudget(profile));
  const hasData = transactions.length > 0;
  const aiAvailable = isLlmConfigured();

  // Run the (Claude-backed) orchestrator only when there's data AND a real key.
  const orchestratorSummary = hasData && aiAvailable ? await runOrchestrator(userId) : null;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Health score based on budget used + savings rate
  const budgetUsedPct = spendingSummary.monthlyBudget > 0
    ? spendingSummary.totalSpent / spendingSummary.monthlyBudget
    : 0;
  const savingsRate = 1 - budgetUsedPct;
  const healthScore = Math.min(
    100,
    Math.max(0, Math.round(50 + savingsRate * 50 + (savingsRate > 0.3 ? 10 : 0)))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Good morning, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here is your financial briefing for {currentDate}.</p>
        </div>
      </div>

      {/* Bank statement upload — populates the dashboard with real data */}
      <StatementUpload />

      {!hasData ? (
        <div className="glass-card rounded-2xl p-10 text-center animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-100">No transactions yet</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Upload a bank statement (CSV or PDF) above, or add a transaction on the Expenses page.
            Your AI briefing and insights populate automatically once we have your data.
          </p>
        </div>
      ) : (
        <>
          {/* Row 1: LangChain AI Orchestrator */}
          {orchestratorSummary ? (
            <OrchestratorWidget summary={orchestratorSummary} />
          ) : !aiAvailable ? (
            <div className="glass-card gradient-border-ai rounded-2xl p-6 animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-100">AI Orchestrator is offline</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl break-words">
                    Set <code className="text-emerald-400 bg-slate-900/70 px-1.5 py-0.5 rounded">ANTHROPIC_API_KEY</code> in
                    your environment to enable the LangChain orchestrator and generate a live plain-language
                    briefing from your real transactions. Your dashboard metrics below are fully functional without it.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Row 2: Quick Stats Grid */}
          <QuickStats user={user} summary={spendingSummary} />

          {/* Row 3: Health Score & Spending Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FinancialHealthScore score={healthScore} />
            </div>
            <div className="lg:col-span-2">
              <SpendingOverview user={user} summary={spendingSummary} />
            </div>
          </div>

          {/* Row 4: Categories & Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdown summary={spendingSummary} />
            <RecentTransactions transactions={transactions.slice(0, 8)} />
          </div>

          {/* Row 5: Monthly Trend */}
          <div className="w-full">
            <MonthlyTrend data={mockMonthlyTrend} />
          </div>
        </>
      )}
    </div>
  );
}
