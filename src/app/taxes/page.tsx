import React from 'react';
import { estimateTax } from '@/lib/tax-agent';
import RegimeComparison from '@/components/taxes/RegimeComparison';
import DeductionTracker from '@/components/taxes/DeductionTracker';
import TaxSummaryCard from '@/components/taxes/TaxSummaryCard';
import { FileText } from 'lucide-react';

/**
 * Route: /taxes — Tax Agent (SHOULD tier)
 * Server component: fetches live data from tax agent at render time.
 */
export default function TaxesPage() {
  const estimation = estimateTax();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-400" />
            Tax Optimization Agent
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20 font-medium">
              SHOULD
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tax estimates, deduction planning, and regime comparison for FY 2025–26.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Recommended Regime</p>
          <p className="text-2xl font-bold text-emerald-400">{estimation.recommendedRegime}</p>
        </div>
      </div>

      {/* Row 1: Summary (full width) */}
      <div className="animate-slide-up">
        <TaxSummaryCard estimation={estimation} />
      </div>

      {/* Row 2: Regime Comparison + Deduction Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <RegimeComparison estimation={estimation} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <DeductionTracker deductions={estimation.deductions} />
        </div>
      </div>

      {/* Row 3: Filing tip */}
      <div
        className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 animate-slide-up"
        style={{ animationDelay: '300ms' }}
      >
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Filing Tip</p>
        <p className="text-sm text-slate-300">
          Under the Old Regime, ensure all investment proofs (ELSS, PPF, LIC premium receipts) are 
          submitted to your employer before the December cut-off to avoid excess TDS deduction. 
          Keep rent receipts handy for HRA verification.
        </p>
      </div>
    </div>
  );
}
