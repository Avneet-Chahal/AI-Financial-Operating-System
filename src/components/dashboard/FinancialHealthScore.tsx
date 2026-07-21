'use client';

import React, { useEffect, useState } from 'react';
import { getHealthScoreColor } from '@/lib/helpers';

export default function FinancialHealthScore({ score = 85 }: { score?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const colorClass = getHealthScoreColor(score);
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col h-full animate-fade-in">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Financial Health</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="64"
              cy="64"
            />
            <circle
              className="transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={strokeColor}
              fill="transparent"
              r={radius}
              cx="64"
              cy="64"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${colorClass}`}>{animatedScore}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-center text-slate-300">
          Your finances are in great shape! Keep up the good work.
        </p>
      </div>
    </div>
  );
}
