'use client';

import React, { useEffect, useState } from 'react';
import { calculateSavingsRate, formatCurrency } from '@/lib/helpers';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { SpendingSummary, UserProfile } from '@/types';

export default function SpendingOverview({ 
  user, 
  summary 
}: { 
  user: UserProfile; 
  summary: SpendingSummary; 
}) {
  const [filled, setFilled] = useState(false);
  const savingsRate = calculateSavingsRate(user.monthlyIncome, summary.totalSpent);
  
  useEffect(() => {
    const timer = setTimeout(() => setFilled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const spentPercent = Math.min(100, Math.round((summary.totalSpent / user.monthlyIncome) * 100));
  const savingsPercent = 100 - spentPercent;

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col h-full animate-fade-in" style={{ animationDelay: '100ms' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-slate-400">Monthly Spending Overview</h3>
        <div className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
          <TrendingDown className="w-3 h-3" />
          <span>4% vs last month</span>
        </div>
      </div>
      
      <div className="space-y-6 flex-1">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm text-slate-500 mb-1">Total Spent</div>
            <div className="text-2xl font-bold text-slate-100">{formatCurrency(summary.totalSpent)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 mb-1">Monthly Income</div>
            <div className="text-lg font-medium text-slate-300">{formatCurrency(user.monthlyIncome)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-2">
          <div className="flex mb-2 items-center justify-between text-xs">
            <div className="text-emerald-400 font-medium">Spent {spentPercent}%</div>
            <div className="text-teal-400 font-medium">Saved {savingsPercent}%</div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-800">
            <div 
              style={{ width: filled ? `${spentPercent}%` : '0%' }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000 ease-out"
            ></div>
            <div 
              style={{ width: filled ? `${savingsPercent}%` : '0%' }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-600 transition-all duration-1000 ease-out"
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <span className="text-sm text-slate-400">Current Savings Rate</span>
          <span className="text-lg font-bold text-teal-400">{savingsRate}%</span>
        </div>
      </div>
    </div>
  );
}
