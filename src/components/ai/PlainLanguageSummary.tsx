import React from 'react';
import { Bot } from 'lucide-react';

export default function PlainLanguageSummary({ text, timestamp }: { text: string, timestamp: string }) {
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <div className="relative animate-fade-in">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-slate-200">AI Orchestrator</span>
            <span className="text-xs text-slate-500">Today at {formattedTime}</span>
          </div>
          
          <div className="glass-card p-6 rounded-2xl rounded-tl-none relative overflow-hidden">
            <div className="absolute top-4 left-4 text-4xl text-indigo-500/20 font-serif leading-none select-none">"</div>
            <div className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium relative z-10 pl-6">
              <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-indigo-400 animate-typing max-w-full">
                {text}
              </span>
            </div>
            <div className="absolute bottom-2 right-4 text-4xl text-indigo-500/20 font-serif leading-none rotate-180 select-none">"</div>
          </div>
        </div>
      </div>
    </div>
  );
}
