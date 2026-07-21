import React from 'react';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold text-emerald-400">💰 AI-FOS</span>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Scaffold Mode</span>
      </div>
      <div className="text-sm text-slate-400">
        User: <span className="text-slate-200 font-medium">Priya (Salaried)</span>
      </div>
    </header>
  );
}
