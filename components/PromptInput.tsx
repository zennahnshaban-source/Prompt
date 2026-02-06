import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon } from './Icons';
import { OptimizationStatus } from '../types';

interface PromptInputProps {
  onOptimize: (prompt: string) => void;
  status: OptimizationStatus;
  externalValue?: string; // Add prop to receive value from parent
  onExternalValueConsumed?: () => void; // Callback to reset parent value
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  onOptimize, 
  status, 
  externalValue, 
  onExternalValueConsumed 
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with external value
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== '') {
      setValue(externalValue);
      if (onExternalValueConsumed) {
        onExternalValueConsumed();
      }
    }
  }, [externalValue, onExternalValueConsumed]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Increase max height to accommodate longer prompts (approx 60% of viewport height)
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, window.innerHeight * 0.6) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    if (value.trim() && status !== OptimizationStatus.LOADING) {
      onOptimize(value);
      setValue('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 pb-6">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <textarea
          ref={textareaRef}
          className="w-full max-h-[60vh] py-3 px-4 bg-transparent text-slate-800 placeholder-slate-400 resize-none focus:outline-none font-sans text-sm leading-relaxed custom-scrollbar"
          placeholder="输入新的想法，或要求微调上一次的结果..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status === OptimizationStatus.LOADING}
          rows={1}
        />
        
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || status === OptimizationStatus.LOADING}
          className={`mb-1 mr-1 p-2 rounded-lg flex-shrink-0 transition-all duration-200
            ${!value.trim() || status === OptimizationStatus.LOADING
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200'
            }`}
        >
            {status === OptimizationStatus.LOADING ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-2 text-center text-xs text-slate-400">
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
};

export default PromptInput;