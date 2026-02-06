import React, { useState } from 'react';
import { HistorySession, PromptTemplate } from '../types';
import { ChatIcon, TrashIcon, RefreshIcon, XIcon, TemplateIcon, HistoryIcon, PlusIcon, EditIcon, FileTextIcon, SettingsIcon } from './Icons';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HistorySession[];
  currentSessionId: string | null;
  onSelectSession: (session: HistorySession) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  templates: PromptTemplate[];
  onSelectTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (templateId: string, e: React.MouseEvent) => void;
  onEditTemplate: (template: PromptTemplate, e: React.MouseEvent) => void;
  onCreateTemplate: () => void;
  onOpenSettings: () => void;
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
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('history');

  return (
    <>
      {/* Mobile Overlay with Fade In */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className={`fixed md:static inset-y-0 left-0 z-40 w-[300px] bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col h-full shadow-2xl md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* Header Area */}
          <div className="p-5 pb-2">
            <div className="flex items-center justify-between mb-5 md:hidden">
               <h2 className="text-lg font-bold text-slate-800">Prompt 炼金术</h2>
               <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-slate-200/60 p-1.5 rounded-xl mb-4">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all
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
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all
                  ${activeTab === 'templates' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                `}
              >
                <TemplateIcon className="w-3.5 h-3.5" />
                我的模板
              </button>
            </div>

             {/* Main Action Button */}
             <button
              onClick={() => {
                activeTab === 'history' ? onNewChat() : onCreateTemplate();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-700 hover:text-indigo-600 rounded-xl transition-all duration-300 group"
            >
              {activeTab === 'history' ? <RefreshIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              <span className="font-semibold text-sm">
                {activeTab === 'history' ? '开启新对话' : '新建模板'}
              </span>
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1.5">
            {activeTab === 'history' ? (
              sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <ChatIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">暂无历史记录</p>
                  <p className="text-xs text-slate-400 mt-1">开始一个新的对话来优化您的 Prompt</p>
                </div>
              ) : (
                sessions.sort((a, b) => b.lastModified - a.lastModified).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`group relative flex items-center gap-3 px-3.5 py-3.5 rounded-xl cursor-pointer transition-all duration-200 border
                      ${currentSessionId === session.id
                        ? 'bg-white border-indigo-200 shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${currentSessionId === session.id ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                       <ChatIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate transition-colors ${currentSessionId === session.id ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {session.title || '未命名对话'}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 group-hover:text-slate-500">
                        {new Date(session.lastModified).toLocaleDateString('zh-CN')} {new Date(session.lastModified).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>

                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="删除"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            ) : (
              templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <TemplateIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">暂无自定义模板</p>
                </div>
              ) : (
                templates.sort((a, b) => b.lastModified - a.lastModified).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className="group relative flex items-start gap-3 px-3.5 py-3.5 rounded-xl cursor-pointer transition-all duration-200 border bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                       <FileTextIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700">
                        {template.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-normal">
                        {template.description || '无描述'}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 absolute right-2 top-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100">
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

          {/* User / Settings Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-xl transition-all duration-200"
            >
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <SettingsIcon className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-sm font-medium">模型设置</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;