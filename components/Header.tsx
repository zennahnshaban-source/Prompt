import React from 'react';
import { SparklesIcon, RefreshIcon, SettingsIcon } from './Icons';
import { AISettings } from '../types';

interface HeaderProps {
  onReset?: () => void;
  settings: AISettings;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, settings, onOpenSettings }) => {
  // Helper to format model name for display
  const getModelDisplayName = () => {
    if (settings.provider === 'gemini') return 'Gemini 3 Pro';
    if (settings.provider === 'openai') return 'GPT-4o';
    if (settings.provider === 'deepseek') return 'DeepSeek';
    // For others, use the provider name or truncate the model name
    return settings.model.length > 15 ? settings.provider : settings.model;
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between py-4 px-4 md:px-8 border-b border-slate-100/50 backdrop-blur-md bg-white/40 transition-all duration-300 z-20">
      <div className="flex items-center gap-3 w-1/4">
          {/* Spacer for sidebar toggle button. */}
          <div className="w-8"></div> 
      </div>
      
      {/* Centered Logo for mobile (absolute center), Left aligned for desktop */}
      <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:flex md:items-center md:gap-3 md:w-1/4 md:justify-start">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 hidden md:flex">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden md:block">Prompt 炼金术</h1>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight md:hidden">Prompt 炼金术</h1>
      </div>
      
      <div className="flex items-center justify-end gap-2 w-1/4 md:w-1/2">
        {/* Model Selector / Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white text-slate-600 rounded-full transition-all duration-200 group"
          title="切换 AI 模型"
        >
          <div className={`w-2 h-2 rounded-full ${settings.provider === 'gemini' ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-emerald-400'} group-hover:animate-pulse`} />
          <span className="text-xs font-semibold max-w-[80px] sm:max-w-none truncate">
            {getModelDisplayName()}
          </span>
          <SettingsIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors ml-0.5" />
        </button>

        {onReset && (
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 hidden sm:flex"
            title="开启新对话"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">新对话</span>
          </button>
        )}
        
        {/* Mobile New Chat Icon Only */}
        {onReset && (
          <button 
            onClick={onReset}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm sm:hidden"
          >
             <RefreshIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;