'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/helpers';

/** Minimal shape the trend needs from a transaction. */
export interface TrendTransaction {
  date: string; // YYYY-MM-DD
  amount: number;
}

interface Bucket {
  label: string;
  amount: number;
}

type Timeframe = '1W' | '1M' | '3M' | '6M';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Bucket real transactions into the series the chart renders for a timeframe. */
function bucketTransactions(transactions: TrendTransaction[], timeframe: Timeframe): Bucket[] {
  const now = new Date();
  const parsed = transactions
    .map((t) => ({ date: new Date(`${t.date}T00:00:00`), amount: t.amount }))
    .filter((t) => !Number.isNaN(t.date.getTime()));

  if (timeframe === '1W') {
    const days: Bucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const amount = parsed
        .filter((t) => t.date.toDateString() === d.toDateString())
        .reduce((s, t) => s + t.amount, 0);
      days.push({ label: DAY_LABELS[d.getDay()], amount });
    }
    return days;
  }

  if (timeframe === '1M') {
    // Last 4 weeks, oldest → newest.
    const weeks: Bucket[] = [];
    for (let w = 3; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const amount = parsed
        .filter((t) => t.date >= start && t.date <= end)
        .reduce((s, t) => s + t.amount, 0);
      weeks.push({ label: `Week ${4 - w}`, amount });
    }
    return weeks;
  }

  // 3M / 6M → per calendar month.
  const monthCount = timeframe === '3M' ? 3 : 6;
  const months: Bucket[] = [];
  for (let m = monthCount - 1; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const amount = parsed
      .filter((t) => t.date.getFullYear() === d.getFullYear() && t.date.getMonth() === d.getMonth())
      .reduce((s, t) => s + t.amount, 0);
    months.push({ label: MONTH_LABELS[d.getMonth()], amount });
  }
  return months;
}

export default function MonthlyTrend({ transactions }: { transactions: TrendTransaction[] }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('6M');
  const [show, setShow] = useState(false);

  const displayData = React.useMemo(
    () => bucketTransactions(transactions, timeframe),
    [transactions, timeframe]
  );

  const total = displayData.reduce((s, d) => s + d.amount, 0);
  const maxAmount = Math.max(1, ...displayData.map((d) => d.amount)) * 1.1; // 10% headroom, never 0

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
          {(['1W', '1M', '3M', '6M'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                timeframe === tf ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-400">No spending in this period.</p>
          <p className="text-xs text-slate-500 mt-1">Try a wider timeframe or upload more transactions.</p>
        </div>
      ) : (
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
              <div key={`${item.label}-${index}`} className="flex-1 flex flex-col items-center group relative z-10">
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  {formatCurrency(item.amount)}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[40px] bg-slate-800 rounded-t-md overflow-hidden flex items-end h-full">
                  <div
                    className={`w-full ${
                      isLast ? 'bg-emerald-500' : 'bg-slate-600 group-hover:bg-slate-500'
                    } transition-all duration-1000 ease-out`}
                    style={{
                      height: show ? `${heightPercent}%` : '0%',
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                </div>

                {/* X-axis label */}
                <div className={`text-xs mt-2 ${isLast ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
