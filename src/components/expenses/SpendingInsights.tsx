'use client';

import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { SpendingSummary } from '@/types';
import { formatCurrency } from '@/lib/helpers';

export default function SpendingInsights({ summary }: { summary: SpendingSummary }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const budgetUtilization = (summary.totalSpent / summary.monthlyBudget) * 100;
  const isWarning = budgetUtilization > 80;

  return (
    <div className="glass-card gradient-border-ai rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Spending Agent Insights</h3>
            <p className="text-xs text-slate-400 hidden sm:block">AI analysis of your recent transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isWarning && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
              <AlertTriangle className="w-3 h-3" />
              Budget Warning
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-slate-800/50 bg-slate-900/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <h4 className="text-sm font-medium text-slate-200">Category Alert</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your <strong className="text-slate-300">{summary.topCategory.replace('_', ' ')}</strong> spending is 23% higher than usual. Consider reducing non-essential expenses this week.
              </p>
            </div>
            
            <div className={`border rounded-xl p-4 ${isWarning ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isWarning ? 'text-red-400' : 'text-slate-400'}`} />
                <h4 className={`text-sm font-medium ${isWarning ? 'text-red-400' : 'text-slate-200'}`}>Budget Utilization</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have utilized <strong className="text-slate-300">{budgetUtilization.toFixed(0)}%</strong> of your {formatCurrency(summary.monthlyBudget)} monthly budget.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <h4 className="text-sm font-medium text-slate-200">AI Forecast</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                At your current run rate, you will likely spend <strong className="text-slate-300">{formatCurrency(summary.forecastedNextMonth)}</strong> next month.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
