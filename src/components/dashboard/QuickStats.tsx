import React from 'react';
import { formatCurrency, calculateSavingsRate } from '@/lib/helpers';
import { Wallet, CreditCard, PiggyBank, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { SpendingSummary, UserProfile } from '@/types';

export default function QuickStats({ 
  user, 
  summary 
}: { 
  user: UserProfile; 
  summary: SpendingSummary;
}) {
  const savings = user.monthlyIncome - summary.totalSpent;
  const budgetRemaining = summary.monthlyBudget - summary.totalSpent;
  
  const stats = [
    {
      title: 'Monthly Income',
      value: formatCurrency(user.monthlyIncome),
      icon: Wallet,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      trend: '+0%',
      trendUp: true
    },
    {
      title: 'Total Spent',
      value: formatCurrency(summary.totalSpent),
      icon: CreditCard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      trend: '-4%',
      trendUp: false
    },
    {
      title: 'Total Savings',
      value: formatCurrency(savings),
      icon: PiggyBank,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Budget Remaining',
      value: formatCurrency(budgetRemaining),
      icon: Target,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      trend: '-2%',
      trendUp: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, i) => (
        <div 
          key={stat.title} 
          className="glass-card p-4 rounded-2xl flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-400">{stat.title}</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {stat.trendUp ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-emerald-400" /> // Using green even for down if spending is down it's good
              )}
              <span className="text-xs text-emerald-400">{stat.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
