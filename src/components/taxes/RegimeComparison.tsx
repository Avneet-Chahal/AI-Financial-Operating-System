'use client';

import React from 'react';
import type { TaxEstimation } from '@/types';
import { CheckCircle } from 'lucide-react';

interface Props {
  estimation: TaxEstimation;
}

export default function RegimeComparison({ estimation }: Props) {
  const { estimatedTaxOldRegime, estimatedTaxNewRegime, recommendedRegime } = estimation;
  const saving = Math.abs(estimatedTaxOldRegime - estimatedTaxNewRegime);

  return (
    <div className="glass-card p-6 rounded-2xl space-y-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tax Regime Comparison</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Old Regime */}
        <div className={`relative p-4 rounded-xl border transition-all ${
          recommendedRegime === 'OLD'
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-slate-700/60 bg-slate-800/40'
        }`}>
          {recommendedRegime === 'OLD' && (
            <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> RECOMMENDED
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1">Old Regime</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">
            ₹{estimatedTaxOldRegime.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">With all deductions</p>
        </div>

        {/* New Regime */}
        <div className={`relative p-4 rounded-xl border transition-all ${
          recommendedRegime === 'NEW'
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-slate-700/60 bg-slate-800/40'
        }`}>
          {recommendedRegime === 'NEW' && (
            <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> RECOMMENDED
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1">New Regime</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">
            ₹{estimatedTaxNewRegime.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">₹75K standard deduction</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-300">
          The <strong>{recommendedRegime}</strong> regime saves you{' '}
          <strong>₹{saving.toLocaleString('en-IN')}</strong> in taxes.
        </p>
      </div>
    </div>
  );
}
