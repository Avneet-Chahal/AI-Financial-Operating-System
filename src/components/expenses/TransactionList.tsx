import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, getCategoryColor, getCategoryIcon, formatDate } from '@/lib/helpers';
import { Repeat, Sparkles } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-fade-in border-dashed border-slate-700">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-300">No transactions found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          We couldn't find any transactions matching your current filters. Try adjusting them or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant / Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {transactions.map((tx, i) => {
              const Icon = getCategoryIcon(tx.category);
              const colorClass = getCategoryColor(tx.category);

              return (
                <tr 
                  key={tx.id} 
                  className="hover:bg-slate-800/30 transition-colors group animate-fade-in"
                  style={{ animationDelay: `${200 + i * 30}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass} bg-opacity-20`}>
                        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                          {tx.merchant}
                          {tx.isRecurring && (
                            <Repeat className="w-3 h-3 text-slate-500" />
                          )}
                          {tx.aiCategorized && (
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                          )}
                        </div>
                        <div className="text-sm text-slate-500 line-clamp-1">{tx.description}</div>
                        <div className="text-xs text-slate-500 mt-1 sm:hidden">
                          {tx.category.replace('_', ' ')} • {formatDate(tx.date)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass.replace('bg-', 'border-')}/30 ${colorClass.replace('bg-', 'text-')} bg-slate-900`}>
                      {tx.category.replace('_', ' ').toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-400">{formatDate(tx.date)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${tx.amount > 0 ? 'text-slate-200' : 'text-emerald-400'}`}>
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
