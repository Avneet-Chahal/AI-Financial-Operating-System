'use client';

import React, { useEffect, useState } from 'react';
import { SpendingSummary } from '@/types';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '@/lib/helpers';
import { Category } from '@/types';

export default function CategoryBreakdown({ summary }: { summary: SpendingSummary }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFilled(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Filter out 0 amounts and sort descending
  const categories = Object.entries(summary.categoryBreakdown)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({
      category: cat as Category,
      amount,
      percentage: Math.round((amount / summary.totalSpent) * 100)
    }));

  return (
    <div className="glass-card p-5 rounded-2xl h-full animate-fade-in" style={{ animationDelay: '200ms' }}>
      <h3 className="text-sm font-medium text-slate-400 mb-6">Spending by Category</h3>
      
      <div className="space-y-4">
        {categories.map((item, index) => {
          const Icon = getCategoryIcon(item.category);
          const colorClass = getCategoryColor(item.category);
          // Extract just the color name for bg (e.g. from bg-emerald-500)
          
          return (
            <div key={item.category} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${colorClass} bg-opacity-20`}>
                    <Icon className={`w-3.5 h-3.5 ${colorClass.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm text-slate-300 capitalize">
                    {item.category.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-200">
                  {formatCurrency(item.amount)}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                    style={{ width: filled ? `${item.percentage}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
