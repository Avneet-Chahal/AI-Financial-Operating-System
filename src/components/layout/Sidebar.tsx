import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const routes = [
    { label: '📊 Dashboard (v1)', path: '/' },
    { label: '💳 Expenses (v1)', path: '/expenses' },
    { label: '🤖 AI Summary (v1)', path: '/ai-summary' },
    { label: '📈 Investments (v2)', path: '/investments' },
    { label: '🧾 Taxes (v2)', path: '/taxes' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4 space-y-2 min-h-screen">
      <div className="text-xs uppercase font-semibold text-slate-500 px-3 mb-2">Navigation</div>
      {routes.map((route) => (
        <Link
          key={route.path}
          href={route.path}
          className="block px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          {route.label}
        </Link>
      ))}
    </aside>
  );
}
