'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Bot, 
  TrendingUp, 
  Receipt,
  LogOut,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, status: 'active', version: 'v1' },
    { label: 'Expenses', path: '/expenses', icon: CreditCard, status: 'active', version: 'v1' },
    { label: 'AI Summary', path: '/ai-summary', icon: Bot, status: 'active', version: 'v1' },
    { label: 'Investments', path: '/investments', icon: TrendingUp, status: 'active', version: 'v2' },
    { label: 'Taxes', path: '/taxes', icon: Receipt, status: 'active', version: 'v2' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 glass-sidebar bg-slate-950/90 md:bg-transparent
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-300 ease-in-out
        flex flex-col h-full shrink-0
      `}>
        <div className="p-4 flex items-center justify-between md:hidden border-b border-slate-800">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
            AI-FOS
          </span>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
          
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 px-3 mb-3">
              Core Modules
            </div>
            {routes.map((route) => {
              const isActive = pathname === route.path;
              const Icon = route.icon;
              const isUpcoming = route.status === 'upcoming';
              
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => isOpen && onClose()}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 relative
                    ${isUpcoming ? 'opacity-60 pointer-events-none' : ''}
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`} />
                    <span className="font-medium text-sm">{route.label}</span>
                  </div>
                  {isUpcoming && (
                    <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                      {route.version}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-800/50 space-y-1">
            <button className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200 text-sm font-medium">
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
              Settings
            </button>
            <button className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-sm font-medium">
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
