'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, User, LogOut, Sparkles, X, Loader2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  onMenuToggle: () => void;
}

interface AssistantAnswer {
  answer: string;
  aiPowered: boolean;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AssistantAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayName = session?.user?.name ?? session?.user?.email ?? 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  // ⌘K / Ctrl+K focuses the assistant search.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setResult(null);
        setError(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function runSearch(query: string) {
    setIsSearching(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setResult({ answer: data.answer, aiPowered: Boolean(data.aiPowered) });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              if (!q || isSearching) return;
              void runSearch(q);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="block w-full pl-10 pr-16 py-2 border border-slate-800 rounded-full leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all focus:bg-slate-900 disabled:opacity-50"
              placeholder={isSearching ? 'AI Agent analyzing…' : "Ask AI-FOS anything… (e.g. 'How much did I spend on food?')"}
            />
          </form>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            ) : (
              <span className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 bg-slate-800">⌘K</span>
            )}
          </div>

          {/* Answer / error panel */}
          {(result || error) && (
            <div className="absolute left-0 right-0 mt-2 z-30 glass-card rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-md p-4 shadow-2xl animate-fade-in">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
              {error ? (
                <p className="text-sm text-red-400 pr-6">{error}</p>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      {result?.aiPowered ? 'AI Orchestrator' : 'Spending Agent'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed pr-6">{result?.answer}</p>
                </>
              )}
            </div>
          )}
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
