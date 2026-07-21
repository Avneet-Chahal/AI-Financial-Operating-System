import React from 'react';
import TransactionList from '@/components/expenses/TransactionList';

/**
 * Route: /expenses (Expense Tracking - v1 MUST)
 */
export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Expenses & Spending Agent</h1>
        <p className="text-sm text-slate-400">Transaction categorization, budget tracking, and forecasting.</p>
      </div>

      <TransactionList />
    </div>
  );
}
