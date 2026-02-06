import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, RefreshIcon, SparklesIcon } from './Icons';
import { OptimizationStatus } from '../types';

interface OptimizedOutputProps {
  output: string;
  status: OptimizationStatus;
}

const OptimizedOutput: React.FC<OptimizedOutputProps> = ({ output, status }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === OptimizationStatus.LOADING) {
      setCopied(false);
    }
  }, [status]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${status === OptimizationStatus.LOADING ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
          Optimized Result
        </h2>
        {output && (
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 
              ${copied 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-transparent'}`}
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-auto bg-[#0B0F19] custom-scrollbar">
        {status === OptimizationStatus.IDLE && !output && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center opacity-60">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <SparklesIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-sm">Ready to transform your prompts.</p>
            </div>
        )}

        {status === OptimizationStatus.LOADING && !output && (
             <div className="p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                <div className="space-y-2 pt-4">
                     <div className="h-3 bg-gray-800/50 rounded w-full"></div>
                     <div className="h-3 bg-gray-800/50 rounded w-full"></div>
                     <div className="h-3 bg-gray-800/50 rounded w-2/3"></div>
                </div>
             </div>
        )}

        <div className="p-6 font-mono text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
          {output}
          {status === OptimizationStatus.LOADING && (
             <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
          )}
        </div>
      </div>
      
      {/* Footer gradient overlay for aesthetic depth */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0B0F19] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default OptimizedOutput;