'use client';

import React, { useState, useEffect } from 'react';
import TransactionList from '@/components/expenses/TransactionList';
import CategoryFilter from '@/components/expenses/CategoryFilter';
import SpendingInsights from '@/components/expenses/SpendingInsights';
import ExpenseStats from '@/components/expenses/ExpenseStats';
import AddTransactionModal from '@/components/expenses/AddTransactionModal';
import { Plus } from 'lucide-react';
import { Category, Transaction, SpendingSummary } from '@/types';
import type { ExpensesResponse } from '@/app/api/expenses/route';

export default function ExpensesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live data from Spending Agent API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/expenses');
        const data: ExpensesResponse = await res.json();
        setTransactions(data.transactions);
        setSummary(data.summary);
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  const categories = summary
    ? (Object.keys(summary.categoryBreakdown) as Category[])
    : [];

  const categoryCounts = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] ?? 0) + 1;
    acc['ALL'] = (acc['ALL'] ?? 0) + 1;
    return acc;
  }, { ALL: 0 });

  const filteredTransactions =
    activeCategory === 'ALL'
      ? transactions
      : transactions.filter((tx) => tx.category === activeCategory);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Expenses &amp; Spending Agent</h1>
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

      {summary && <ExpenseStats summary={summary} totalTransactions={transactions.length} />}
      {summary && <SpendingInsights summary={summary} />}

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
