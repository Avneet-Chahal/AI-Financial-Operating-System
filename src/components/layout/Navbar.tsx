'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const displayName = session?.user?.name ?? session?.user?.email ?? 'Account';
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <header className="h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-sm">₹</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 hidden sm:block">
            AI-FOS
          </span>
        </div>
      </div>
      
      <div className="flex-1 max-w-xl px-4 md:px-8 hidden sm:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            setIsSearching(true);
            setTimeout(() => {
              setIsSearching(false);
              setSearchQuery('');
              alert(`AI Agent analyzed: "${searchQuery}"\n(This is a demo interaction)`);
            }, 1000);
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="block w-full pl-10 pr-3 py-2 border border-slate-800 rounded-full leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all focus:bg-slate-900 disabled:opacity-50"
              placeholder={isSearching ? "AI Agent analyzing..." : "Ask AI-FOS anything... (e.g. 'How much did I spend on food?')"}
            />
          </form>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 bg-slate-800">⌘K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800/50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-3 group">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
              {displayName}
            </div>
            <div className="text-xs text-slate-500">Free Tier</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-transparent group-hover:ring-emerald-500/50 transition-all">
            {session?.user ? (
              <span className="text-sm font-bold text-white">{initial}</span>
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-800/50"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
