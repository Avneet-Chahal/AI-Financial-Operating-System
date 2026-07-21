import React from 'react';
import { formatCurrency } from '@/lib/helpers';
import { SpendingSummary } from '@/types';
import { CreditCard, Calendar, TrendingDown, Hash } from 'lucide-react';

export default function ExpenseStats({ summary, totalTransactions }: { summary: SpendingSummary, totalTransactions: number }) {
  const dailyAverage = summary.totalSpent / 30; // approx

  const stats = [
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalSpent),
      icon: CreditCard,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Daily Average',
      value: formatCurrency(dailyAverage),
      icon: Calendar,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Top Category',
      value: summary.topCategory.replace('_', ' '),
      icon: TrendingDown,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Transactions',
      value: totalTransactions.toString(),
      icon: Hash,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, i) => (
        <div key={stat.title} className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bgColor}`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-medium text-slate-400 whitespace-nowrap">{stat.title}</div>
            <div className="text-base sm:text-lg font-bold text-slate-100 truncate mt-0.5 capitalize">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
