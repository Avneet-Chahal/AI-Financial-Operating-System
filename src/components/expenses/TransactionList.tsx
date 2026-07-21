import React from 'react';

/**
 * Placeholder Component: Transaction List Table
 */
export default function TransactionList() {
  return (
    <div className="border border-slate-800 rounded-lg bg-slate-900 p-4">
      <h3 className="text-md font-semibold text-slate-200 mb-3">Recent Transactions</h3>
      <div className="text-sm text-slate-400 space-y-2">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>Olive Bistro (Food & Dining)</span>
          <span className="text-red-400">- ₹ 4,500</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>Apartment Rent (Housing)</span>
          <span className="text-red-400">- ₹ 25,000</span>
        </div>
        <div className="flex justify-between pb-1">
          <span>Uber Airport (Transport)</span>
          <span className="text-red-400">- ₹ 1,200</span>
        </div>
      </div>
    </div>
  );
}
