import React from 'react';
import { redirect } from 'next/navigation';
import { analyzeInvestmentsForUser } from '@/lib/investment-agent';
import PortfolioCard from '@/components/investments/PortfolioCard';
import AssetAllocationChart from '@/components/investments/AssetAllocationChart';
import TaxSavingCard from '@/components/investments/TaxSavingCard';
import { TrendingUp, PiggyBank } from 'lucide-react';
import { getCurrentUserId, getUserTransactions } from '@/lib/data';

/**
 * Route: /investments — Investment Agent (SHOULD tier)
 * Server component: builds the portfolio from the signed-in user's real
 * investment transactions. Shows an empty state until the user has any.
 */
export default async function InvestmentsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const transactions = await getUserTransactions(userId);
  const analysis = analyzeInvestmentsForUser(transactions);

  if (!analysis) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            Investment Agent
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20 font-medium">
              SHOULD
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Portfolio analysis, asset allocation, and tax-efficient wealth recommendations.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-10 text-center animate-fade-in">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">No investments yet</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Upload a bank statement on the dashboard, or add transactions in the{' '}
            <span className="text-emerald-400 font-medium">INVESTMENTS</span> category (SIPs, ELSS, PPF,
            NPS, gold bonds). The Investment Agent builds your portfolio, asset allocation, and
            tax-saving analysis automatically from that data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            Investment Agent
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20 font-medium">
              SHOULD
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Portfolio analysis, asset allocation, and tax-efficient wealth recommendations.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Return</p>
          <p className="text-2xl font-bold text-emerald-400">+{analysis.annualizedReturn}%</p>
        </div>
      </div>

      {/* Row 1: Portfolio Card (full width) */}
      <div className="animate-slide-up">
        <PortfolioCard analysis={analysis} />
      </div>

      {/* Row 2: Allocation + Tax Saving */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <AssetAllocationChart allocation={analysis.portfolio.allocation} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <TaxSavingCard opportunities={analysis.taxSavingHeadroom} />
        </div>
      </div>

      {/* Estimated-value disclosure */}
      <p className="text-xs text-slate-500 animate-fade-in">
        Portfolio built from your investment transactions. Current values are estimated using
        illustrative per-asset-class growth (live brokerage/NAV sync is on the roadmap).
      </p>

      {/* Row 3: Risk Profile */}
      <div className="glass-card p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '300ms' }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Risk Profile Assessment</p>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={analysis.riskLabel === 'AGGRESSIVE' ? '#f87171' : analysis.riskLabel === 'MODERATE' ? '#fbbf24' : '#34d399'}
                strokeWidth="3"
                strokeDasharray={`${analysis.riskScore * 10} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-100">
              {analysis.riskScore}/10
            </span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">{analysis.riskLabel} Risk Portfolio</p>
            <p className="text-sm text-slate-400 mt-1">
              {analysis.riskLabel === 'AGGRESSIVE'
                ? 'High equity exposure — suitable for long-term (7+ year) investment horizons.'
                : analysis.riskLabel === 'MODERATE'
                ? 'Balanced mix of equity and debt. Good for medium-term (3–7 year) goals.'
                : 'Conservative allocation. Consider increasing equity for better long-term returns.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
