'use client';

import React from 'react';
import type { InvestmentAnalysis } from '@/lib/investment-agent';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  analysis: InvestmentAnalysis;
}

export default function PortfolioCard({ analysis }: Props) {
  const { portfolio, annualizedReturn, riskLabel, riskScore } = analysis;
  const isGain = portfolio.unrealizedGains >= 0;

  const riskColor =
    riskLabel === 'AGGRESSIVE'
      ? 'text-red-400 bg-red-500/10 border-red-500/20'
      : riskLabel === 'MODERATE'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className="glass-card p-6 rounded-2xl space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Value</p>
          <p className="text-3xl font-bold text-slate-100 mt-1">
            ₹{portfolio.totalValue.toLocaleString('en-IN')}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${riskColor}`}>
          {riskLabel} · {riskScore}/10
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isGain ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        <span className={`text-sm font-semibold ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
          {isGain ? '+' : ''}₹{portfolio.unrealizedGains.toLocaleString('en-IN')}
        </span>
        <span className="text-xs text-slate-500">
          unrealised gains ({annualizedReturn}% return)
        </span>
      </div>

      {/* Holdings mini-list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Holdings</p>
        {analysis.holdings.map((h) => {
          const pnl = h.currentValue - h.investedAmount;
          const pnlPct = ((pnl / h.investedAmount) * 100).toFixed(1);
          return (
            <div key={h.name} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
              <div>
                <p className="text-sm text-slate-200 font-medium">{h.name}</p>
                <p className="text-xs text-slate-500">{h.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-100">₹{h.currentValue.toLocaleString('en-IN')}</p>
                <p className={`text-xs font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPct}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
