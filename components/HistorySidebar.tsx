import React, { useState } from 'react';
import { HistorySession, PromptTemplate } from '../types';
import { ChatIcon, TrashIcon, RefreshIcon, XIcon, TemplateIcon, HistoryIcon, PlusIcon, EditIcon, FileTextIcon } from './Icons';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  
  // History Props
  sessions: HistorySession[];
  currentSessionId: string | null;
  onSelectSession: (session: HistorySession) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onNewChat: () => void;

  // Template Props
  templates: PromptTemplate[];
  onSelectTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (templateId: string, e: React.MouseEvent) => void;
  onEditTemplate: (template: PromptTemplate, e: React.MouseEvent) => void;
  onCreateTemplate: () => void;
}

type Tab = 'history' | 'templates';

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  templates,
  onSelectTemplate,
  onDeleteTemplate,
  onEditTemplate,
  onCreateTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('history');

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:static inset-y-0 left-0 z-40 w-[280px] bg-slate-50/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
          ${isOpen ? 'md:w-[280px] md:border-r' : ''}
        `}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header & Tabs */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
               {/* Mobile Close */}
               <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider md:hidden">
                  菜单
               </h2>
               <button 
                onClick={onClose}
                className="md:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all
                  ${activeTab === 'history' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                `}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                历史记录
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all
                  ${activeTab === 'templates' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                `}
              >
                <TemplateIcon className="w-3.5 h-3.5" />
                我的模板
              </button>
            </div>
          </div>

          {/* Action Button */}
          {activeTab === 'history' ? (
             <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-700 hover:text-indigo-600 rounded-xl transition-all duration-200 mb-4 group flex-shrink-0"
            >
              <RefreshIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="font-medium">开启新对话</span>
            </button>
          ) : (
            <button
              onClick={onCreateTemplate}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-700 hover:text-indigo-600 rounded-xl transition-all duration-200 mb-4 group flex-shrink-0"
            >
              <PlusIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="font-medium">新建模板</span>
            </button>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-1">
            {activeTab === 'history' ? (
              // --- History List ---
              sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <p className="text-xs text-slate-400">暂无历史记录</p>
                </div>
              ) : (
                sessions.sort((a, b) => b.lastModified - a.lastModified).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 border
                      ${currentSessionId === session.id
                        ? 'bg-indigo-50 border-indigo-100 shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'
                      }
                    `}
                  >
                    <ChatIcon className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${currentSessionId === session.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {session.title || '未命名对话'}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {new Date(session.lastModified).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      title="删除"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            ) : (
              // --- Template List ---
              templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                  <TemplateIcon className="w-8 h-8 text-slate-200" />
                  <p className="text-xs text-slate-400">暂无自定义模板</p>
                </div>
              ) : (
                templates.sort((a, b) => b.lastModified - a.lastModified).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className="group relative flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 border bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm"
                  >
                    <FileTextIcon className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700">
                        {template.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                        {template.description || '无描述'}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 absolute right-2 top-2">
                       <button
                        onClick={(e) => onEditTemplate(template, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                        title="编辑"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => onDeleteTemplate(template.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="删除"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;