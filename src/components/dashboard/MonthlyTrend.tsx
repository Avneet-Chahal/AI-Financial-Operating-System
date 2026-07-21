'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/helpers';

interface TrendData {
  month: string;
  amount: number;
}

export default function MonthlyTrend({ data }: { data: TrendData[] }) {
  const [show, setShow] = useState(false);
  const maxAmount = Math.max(...data.map(d => d.amount)) * 1.1; // 10% headroom

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass-card p-5 rounded-2xl h-full animate-fade-in" style={{ animationDelay: '250ms' }}>
      <h3 className="text-sm font-medium text-slate-400 mb-6">6-Month Spending Trend</h3>
      
      <div className="h-48 flex items-end justify-between gap-2 relative">
        {/* Y-axis guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-t border-slate-600 w-full"></div>
          <div className="border-t border-slate-600 w-full"></div>
          <div className="border-t border-slate-600 w-full"></div>
          <div className="border-t border-slate-600 w-full"></div>
        </div>

        {data.map((item, index) => {
          const heightPercent = (item.amount / maxAmount) * 100;
          const isLast = index === data.length - 1;
          
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center group relative z-10">
              {/* Tooltip */}
              <div className="absolute -top-10 bg-slate-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                {formatCurrency(item.amount)}
              </div>
              
              {/* Bar */}
              <div className="w-full max-w-[40px] bg-slate-800 rounded-t-md overflow-hidden flex items-end h-full">
                <div 
                  className={`w-full ${isLast ? 'bg-emerald-500' : 'bg-slate-600 group-hover:bg-slate-500'} transition-all duration-1000 ease-out`}
                  style={{ 
                    height: show ? `${heightPercent}%` : '0%',
                    transitionDelay: `${index * 100}ms`
                  }}
                />
              </div>
              
              {/* X-axis label */}
              <div className={`text-xs mt-2 ${isLast ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                {item.month}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
