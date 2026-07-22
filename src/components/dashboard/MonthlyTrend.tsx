'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/helpers';

interface TrendData {
  month: string;
  amount: number;
}

export default function MonthlyTrend({ data }: { data: TrendData[] }) {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M'>('6M');
  const [show, setShow] = useState(false);

  const displayData = React.useMemo(() => {
    if (timeframe === '1W') {
      return [
        { month: 'Mon', amount: 1200 },
        { month: 'Tue', amount: 800 },
        { month: 'Wed', amount: 2100 },
        { month: 'Thu', amount: 400 },
        { month: 'Fri', amount: 3200 },
        { month: 'Sat', amount: 1500 },
        { month: 'Sun', amount: 900 },
      ];
    }
    if (timeframe === '1M') {
      return [
        { month: 'Week 1', amount: 8500 },
        { month: 'Week 2', amount: 12000 },
        { month: 'Week 3', amount: 9200 },
        { month: 'Week 4', amount: 11500 },
      ];
    }
    if (timeframe === '3M') {
      return data.slice(-3);
    }
    return data;
  }, [timeframe, data]);

  const maxAmount = Math.max(...displayData.map(d => d.amount)) * 1.1; // 10% headroom

  useEffect(() => {
    setShow(false);
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, [timeframe]);

  return (
    <div className="glass-card p-5 rounded-2xl h-full animate-fade-in" style={{ animationDelay: '250ms' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-slate-400">Spending Trend</h3>
        <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700/50">
          {(['1W', '1M', '3M', '6M'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${timeframe === tf ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-48 flex items-end justify-between gap-2 relative">
        {/* Y-axis guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-t border-slate-600 w-full"></div>
          <div className="border-t border-slate-600 w-full"></div>
          <div className="border-t border-slate-600 w-full"></div>
          <div className="border-t border-slate-600 w-full"></div>
        </div>

        {displayData.map((item, index) => {
          const heightPercent = (item.amount / maxAmount) * 100;
          const isLast = index === displayData.length - 1;
          
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
