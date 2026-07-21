'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '@/types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    description: '',
    category: 'FOOD_DINING' as Category,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
      id: `tx_new_${Date.now()}`,
      aiCategorized: false
    });
    onClose();
  };

  const categories: Category[] = [
    'HOUSING', 'FOOD_DINING', 'TRANSPORTATION', 
    'ENTERTAINMENT', 'UTILITIES', 'INVESTMENTS', 'MISCELLANEOUS'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md relative z-10 animate-slide-up shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100">Add Transaction</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (₹)</label>
            <input 
              type="number" 
              required
              min="1"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Merchant Name</label>
            <input 
              type="text" 
              required
              value={formData.merchant}
              onChange={e => setFormData({...formData, merchant: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="e.g. Swiggy, Amazon"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Description (Optional)</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="Additional details"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.isRecurring ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'}`}
            >
              {formData.isRecurring && <Check className="w-4 h-4 text-white" />}
            </button>
            <label className="text-sm font-medium text-slate-300 cursor-pointer" onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}>
              This is a recurring transaction
            </label>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
