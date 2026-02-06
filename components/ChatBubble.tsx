import React, { useState } from 'react';
import { CopyIcon, CheckIcon, SparklesIcon, FileTextIcon } from './Icons';
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
      <div className="flex justify-end mb-8 group animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
             
             {/* Attachments Preview */}
             {message.attachments && message.attachments.length > 0 && (
               <div className="flex flex-wrap gap-2 justify-end mb-2">
                 {message.attachments.map((att, i) => (
                   <div key={i} className="relative rounded-lg overflow-hidden border border-indigo-100 shadow-sm">
                      {att.mimeType.startsWith('image/') ? (
                         <img 
                           src={`data:${att.mimeType};base64,${att.data}`} 
                           alt="uploaded content" 
                           className="max-h-32 max-w-[200px] object-cover"
                         />
                      ) : (
                         <div className="flex items-center gap-2 p-3 bg-white">
                           <div className="w-8 h-8 bg-red-50 text-red-500 rounded flex items-center justify-center">
                             <FileTextIcon className="w-5 h-5" />
                           </div>
                           <span className="text-xs text-slate-600 font-medium">{att.name || '文件附件'}</span>
                         </div>
                      )}
                   </div>
                 ))}
               </div>
             )}

             <div className="bg-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md shadow-indigo-200/20 transition-all hover:shadow-lg hover:shadow-indigo-200/30">
                <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</p>
             </div>
             <span className="text-[10px] text-slate-400 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-10 w-full group animate-[fadeIn_0.3s_ease-out]">
      <div className="flex-shrink-0 mt-1 hidden sm:block">
        <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
          <SparklesIcon className="w-5 h-5 text-indigo-500" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0 max-w-4xl">
        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50/50 border-b border-slate-100/80 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              {message.isStreaming ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-indigo-600">正在思考与构建...</span>
                  </>
              ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">优化完成</span>
                  </>
              )}
            </span>
            
            {!message.isStreaming && message.content && (
              <div className="flex items-center gap-2">
                 <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border
                      ${copied 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm'}`}
                  >
                    {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                    {copied ? '已复制' : '复制'}
                  </button>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6 font-mono text-[13.5px] leading-7 text-slate-700 whitespace-pre-wrap bg-white selection:bg-indigo-100">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;