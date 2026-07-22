'use client';

import React from 'react';
import type { TaxEstimation } from '@/types';
import { Receipt } from 'lucide-react';

interface Props {
  estimation: TaxEstimation;
}

export default function TaxSummaryCard({ estimation }: Props) {
  const { taxableIncome, estimatedTaxOldRegime, recommendedRegime } = estimation;
  const effectiveRate = taxableIncome > 0
    ? ((estimatedTaxOldRegime / taxableIncome) * 100).toFixed(1)
    : '0.0';

  const bestTax = recommendedRegime === 'OLD'
    ? estimation.estimatedTaxOldRegime
    : estimation.estimatedTaxNewRegime;

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Receipt className="w-4 h-4 text-indigo-400" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tax Summary</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-800/60 rounded-xl">
          <p className="text-xs text-slate-500">Taxable Income</p>
          <p className="text-lg font-bold text-slate-100 mt-0.5">
            ₹{taxableIncome.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <p className="text-xs text-indigo-300">Best Case Tax</p>
          <p className="text-lg font-bold text-indigo-400 mt-0.5">
            ₹{bestTax.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl">
          <p className="text-xs text-slate-500">Effective Rate</p>
          <p className="text-lg font-bold text-slate-100 mt-0.5">{effectiveRate}%</p>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl">
          <p className="text-xs text-slate-500">Recommended</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{recommendedRegime} Regime</p>
        </div>
      </div>
    </div>
  );
}
