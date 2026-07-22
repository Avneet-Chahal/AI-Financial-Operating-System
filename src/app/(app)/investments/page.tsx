import React from 'react';
import { analyzeInvestments } from '@/lib/investment-agent';
import PortfolioCard from '@/components/investments/PortfolioCard';
import AssetAllocationChart from '@/components/investments/AssetAllocationChart';
import TaxSavingCard from '@/components/investments/TaxSavingCard';
import { TrendingUp } from 'lucide-react';

/**
 * Route: /investments — Investment Agent (SHOULD tier)
 * Server component: fetches live data from investment agent at render time.
 */
export default function InvestmentsPage() {
  const analysis = analyzeInvestments();

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
