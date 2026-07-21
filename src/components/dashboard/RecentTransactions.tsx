import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, getCategoryColor, getCategoryIcon, formatDate } from '@/lib/helpers';
import Link from 'next/link';

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  // Show only top 5
  const displayTx = transactions.slice(0, 5);

  return (
    <div className="glass-card p-5 rounded-2xl h-full animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-slate-400">Recent Transactions</h3>
        <Link href="/expenses" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
          View All &rarr;
        </Link>
      </div>

      <div className="space-y-4">
        {displayTx.map((tx, i) => {
          const Icon = getCategoryIcon(tx.category);
          const colorClass = getCategoryColor(tx.category);

          return (
            <div 
              key={tx.id} 
              className="flex items-center justify-between group hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition-colors animate-slide-up"
              style={{ animationDelay: `${350 + i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass} bg-opacity-20`}>
                  <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {tx.merchant}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(tx.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-slate-200' : 'text-emerald-400'}`}>
                  {formatCurrency(tx.amount)}
                </p>
                <p className="text-[10px] uppercase text-slate-500 mt-0.5">
                  {tx.category.replace('_', ' ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
