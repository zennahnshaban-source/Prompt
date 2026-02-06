import React, { useState } from 'react';
import { CopyIcon, CheckIcon, SparklesIcon } from './Icons';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] bg-slate-100 text-slate-800 px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm border border-slate-200">
          <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-8 w-full">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-100">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden group">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${message.isStreaming ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-500'}`}></span>
              优化后的 Prompt
            </span>
            {!message.isStreaming && message.content && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all duration-200 
                  ${copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}
              >
                {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          
          <div className="p-5 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap selection:bg-indigo-100">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;