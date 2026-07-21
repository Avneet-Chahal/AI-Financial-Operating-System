'use client';

import React, { useState } from 'react';
import TransactionList from '@/components/expenses/TransactionList';
import CategoryFilter from '@/components/expenses/CategoryFilter';
import SpendingInsights from '@/components/expenses/SpendingInsights';
import ExpenseStats from '@/components/expenses/ExpenseStats';
import AddTransactionModal from '@/components/expenses/AddTransactionModal';
import { Plus } from 'lucide-react';
import { mockTransactions, mockSpendingSummary } from '@/lib/mockData';
import { Category, Transaction } from '@/types';

export default function ExpensesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);

  // Calculate category counts
  const categoryCounts = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + 1;
    acc['ALL'] = (acc['ALL'] || 0) + 1;
    return acc;
  }, { 'ALL': 0 } as Record<string, number>);

  const categories = Object.keys(mockSpendingSummary.categoryBreakdown) as Category[];

  // Filter transactions
  const filteredTransactions = activeCategory === 'ALL' 
    ? transactions 
    : transactions.filter(tx => tx.category === activeCategory);

  const handleAddTransaction = (newTx: any) => {
    setTransactions([newTx, ...transactions]);
    // In a real app, you would also post this to your API
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Expenses & Spending Agent</h1>
          <p className="text-sm text-slate-400 mt-1">Transaction categorization, budget tracking, and forecasting.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <ExpenseStats summary={mockSpendingSummary} totalTransactions={transactions.length} />

      <SpendingInsights summary={mockSpendingSummary} />

      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          counts={categoryCounts}
        />
      </div>

      <TransactionList transactions={filteredTransactions} />

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTransaction} 
      />
    </div>
  );
}
