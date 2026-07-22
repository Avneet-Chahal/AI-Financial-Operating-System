'use client';

import React from 'react';
import type { AssetAllocation } from '@/types';

interface Props {
  allocation: AssetAllocation;
}

const SEGMENTS = [
  { key: 'equityPercentage', label: 'Equity', color: 'bg-indigo-500', text: 'text-indigo-400' },
  { key: 'debtPercentage', label: 'Debt', color: 'bg-emerald-500', text: 'text-emerald-400' },
  { key: 'goldPercentage', label: 'Gold', color: 'bg-amber-400', text: 'text-amber-400' },
  { key: 'cashPercentage', label: 'Cash', color: 'bg-slate-500', text: 'text-slate-400' },
] as const;

export default function AssetAllocationChart({ allocation }: Props) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset Allocation</p>

      {/* Bar chart */}
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {SEGMENTS.map(({ key, color }) => {
          const pct = allocation[key];
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className={`${color} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {SEGMENTS.map(({ key, label, color, text }) => {
          const pct = allocation[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-xs text-slate-400">{label}</span>
              <span className={`text-xs font-bold ml-auto ${text}`}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
