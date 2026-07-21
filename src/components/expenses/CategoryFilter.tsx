import React from 'react';
import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: Category | 'ALL';
  onSelect: (category: Category | 'ALL') => void;
  counts: Record<Category | 'ALL', number>;
}

export default function CategoryFilter({ categories, activeCategory, onSelect, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <button
        onClick={() => onSelect('ALL')}
        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeCategory === 'ALL'
            ? 'bg-slate-100 text-slate-900 shadow-md'
            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
        }`}
      >
        All
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === 'ALL' ? 'bg-slate-300 text-slate-800' : 'bg-slate-700 text-slate-400'}`}>
          {counts['ALL'] || 0}
        </span>
      </button>

      {categories.map((category) => {
        const isActive = activeCategory === category;
        const count = counts[category] || 0;
        
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <span className="capitalize">{category.replace('_', ' ').toLowerCase()}</span>
            {count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
