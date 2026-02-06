import React from 'react';
import { SparklesIcon, RefreshIcon } from './Icons';

interface HeaderProps {
  onReset?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-0 border-b border-transparent md:border-transparent">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Prompt 炼金术</h1>
          <p className="text-xs text-slate-500 font-mono">由 Gemini 3 Pro 驱动</p>
        </div>
      </div>
      
      {onReset && (
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition-all shadow-sm hover:shadow focus:outline-none active:scale-95"
          title="开启新对话"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">新对话</span>
        </button>
      )}
    </header>
  );
};

export default Header;