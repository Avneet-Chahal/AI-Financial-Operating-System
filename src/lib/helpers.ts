import { Category } from '@/types';
import { 
  Home, 
  Utensils, 
  Car, 
  Film, 
  Zap, 
  TrendingUp, 
  MoreHorizontal 
} from 'lucide-react';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

export const getCategoryColor = (category: Category): string => {
  const colors: Record<Category, string> = {
    HOUSING: 'bg-indigo-500',
    FOOD_DINING: 'bg-amber-500',
    TRANSPORTATION: 'bg-sky-500',
    ENTERTAINMENT: 'bg-pink-500',
    UTILITIES: 'bg-teal-500',
    INVESTMENTS: 'bg-emerald-500',
    MISCELLANEOUS: 'bg-slate-500',
  };
  return colors[category] || 'bg-slate-500';
};

export const getCategoryIcon = (category: Category) => {
  const icons: Record<Category, any> = {
    HOUSING: Home,
    FOOD_DINING: Utensils,
    TRANSPORTATION: Car,
    ENTERTAINMENT: Film,
    UTILITIES: Zap,
    INVESTMENTS: TrendingUp,
    MISCELLANEOUS: MoreHorizontal,
  };
  return icons[category] || MoreHorizontal;
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

export const calculateSavingsRate = (income: number, spent: number): number => {
  if (income <= 0) return 0;
  const savings = income - spent;
  return Math.max(0, Math.round((savings / income) * 100));
};
