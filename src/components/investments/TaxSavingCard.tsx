'use client';

import React from 'react';
import type { TaxSavingOpportunity } from '@/lib/investment-agent';
import { ShieldCheck } from 'lucide-react';

interface Props {
  opportunities: TaxSavingOpportunity[];
}

export default function TaxSavingCard({ opportunities }: Props) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tax Saving Opportunities</p>
      </div>

      {opportunities.map((opp) => {
        const usedPct = Math.round((opp.utilized / opp.maxLimit) * 100);
        return (
          <div key={opp.section} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">Section {opp.section}</p>
                <p className="text-xs text-slate-500">{opp.instrument}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  ₹{opp.utilized.toLocaleString('en-IN')} / ₹{opp.maxLimit.toLocaleString('en-IN')}
                </p>
                <p className="text-xs font-semibold text-emerald-400">
                  Save ₹{opp.estimatedTaxSaving.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(usedPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{usedPct}% utilized</span>
              <span>₹{opp.remaining.toLocaleString('en-IN')} remaining</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
