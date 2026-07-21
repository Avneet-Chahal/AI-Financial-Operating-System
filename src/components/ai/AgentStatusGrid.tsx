import React from 'react';
import { OrchestratorSummary } from '@/types';
import { 
  CreditCard, 
  TrendingUp, 
  Receipt, 
  Landmark, 
  ShieldAlert, 
  Target, 
  Globe 
} from 'lucide-react';

export default function AgentStatusGrid({ status }: { status: OrchestratorSummary['agentStatus'] }) {
  const agents = [
    { id: 'SPENDING', name: 'Spending Agent', icon: CreditCard, color: 'text-indigo-400' },
    { id: 'INVESTMENT', name: 'Investment Agent', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'TAX', name: 'Tax Agent', icon: Receipt, color: 'text-amber-400' },
    { id: 'LOAN', name: 'Loan Agent', icon: Landmark, color: 'text-sky-400' },
    { id: 'FRAUD', name: 'Fraud Agent', icon: ShieldAlert, color: 'text-red-400' },
    { id: 'GOAL_PLANNING', name: 'Goals Agent', icon: Target, color: 'text-purple-400' },
    { id: 'ECONOMIC_INTELLIGENCE', name: 'Economic Agent', icon: Globe, color: 'text-teal-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-fade-in">
      {agents.map((agent, i) => {
        const agentStatus = status[agent.id as keyof typeof status];
        const isActive = agentStatus === 'ACTIVE';

        return (
          <div 
            key={agent.id} 
            className={`glass-card p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border ${
              isActive ? 'border-slate-700/50 hover:bg-slate-800/50' : 'opacity-50 border-transparent bg-slate-900/30'
            } transition-colors`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative">
              <agent.icon className={`w-6 h-6 ${isActive ? agent.color : 'text-slate-600'}`} />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide leading-tight">
              {agent.name.replace(' Agent', '')}
            </div>
            <div className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
              isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
            }`}>
              {isActive ? 'Active' : 'Idle'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
