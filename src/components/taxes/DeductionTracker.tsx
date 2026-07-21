'use client';

import React from 'react';
import type { TaxDeduction } from '@/types';

interface Props {
  deductions: TaxDeduction[];
}

const SECTION_LABELS: Record<TaxDeduction['section'], string> = {
  '80C': 'Section 80C — ELSS / PPF / NSC',
  '80D': 'Section 80D — Health Insurance',
  '80CCD': 'Section 80CCD — NPS',
  HRA: 'HRA Exemption',
  STANDARD: 'Standard Deduction',
};

export default function DeductionTracker({ deductions }: Props) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deductions Tracker</p>

      <div className="space-y-4">
        {deductions.map((d) => {
          const usedPct = d.limit > 0 ? Math.round((d.utilized / d.limit) * 100) : 100;
          const isMaxed = d.remaining === 0;
          return (
            <div key={d.section} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">{SECTION_LABELS[d.section]}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isMaxed
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {isMaxed ? 'Maxed out ✓' : `₹${d.remaining.toLocaleString('en-IN')} left`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isMaxed ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(usedPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>₹{d.utilized.toLocaleString('en-IN')} used</span>
                <span>Limit: ₹{d.limit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
