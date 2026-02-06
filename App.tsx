import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChatBubble from './components/ChatBubble';
import HistorySidebar from './components/HistorySidebar';
import TemplateModal from './components/TemplateModal';
import { createOptimizerSession, OptimizerSession } from './services/geminiService';
import { OptimizationStatus, ChatMessage, HistorySession, PromptTemplate } from './types';
import { SparklesIcon, MenuIcon, XIcon, ArrowRightIcon } from './components/Icons';

const EXAMPLES = [
  {
    label: "公众号文章策划",
    text: "我想写一篇关于“职场时间管理”的公众号文章，风格要轻松幽默，目标受众是刚入职的年轻人，需要包含3个实用的技巧。"
  },
  {
    label: "Python 数据分析",
    text: "写一个 Python 脚本，读取 sales.csv 文件，清洗缺失数据，计算每月的总销售额，并使用 Matplotlib 绘制趋势折线图。"
  },
  {
    label: "雅思口语陪练",
    text: "请扮演我的雅思口语考官，和我进行 Part 2 的模拟考试，主题是“描述一本你喜欢的书”。请在对话结束后给出语法和词汇的改进建议。"
  },
  {
    label: "Midjourney 绘画",
    text: "生成一段 Midjourney 提示词，画面是一个悬浮在云端的未来生态城市，赛博朋克风格与自然景观结合，吉卜力画风，8k分辨率。"
  }
];

const HISTORY_STORAGE_KEY = 'prompt_alchemy_history';
const TEMPLATES_STORAGE_KEY = 'prompt_alchemy_templates';

const App: React.FC = () => {
  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<OptimizationStatus>(OptimizationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputPayload, setInputPayload] = useState<string>(''); // Used to fill PromptInput
  
  // --- Template State ---
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  // --- Refs ---
  const sessionRef = useRef<OptimizerSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Lifecycle: Load Data ---
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) setSessions(JSON.parse(storedHistory));

      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
    
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  // --- Lifecycle: Save Data ---
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  // --- Initial Session ---
  useEffect(() => {
    if (!sessionRef.current) {
        sessionRef.current = createOptimizerSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  // --- Session Logic ---
  const handleNewChat = () => {
    setMessages([]);
    setStatus(OptimizationStatus.IDLE);
    setError(null);
    setCurrentSessionId(null);
    sessionRef.current = createOptimizerSession(); 
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectSession = (session: HistorySession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setStatus(OptimizationStatus.SUCCESS);
    setError(null);
    sessionRef.current = createOptimizerSession(session.messages);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) handleNewChat();
  };

  // --- Template Logic ---
  const handleSaveTemplate = (templateData: Omit<PromptTemplate, 'id' | 'lastModified'>) => {
    if (editingTemplate) {
      // Update existing
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...templateData, lastModified: Date.now() } 
          : t
      ));
    } else {
      // Create new
      const newTemplate: PromptTemplate = {
        id: Date.now().toString(),
        lastModified: Date.now(),
        ...templateData
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleEditTemplate = (template: PromptTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setInputPayload(template.content);
    // Don't auto-submit, let user fill in placeholders
  };

  // --- Optimization Logic ---
  const handleOptimize = async (userPrompt: string) => {
    setStatus(OptimizationStatus.LOADING);
    setError(null);

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      setCurrentSessionId(activeSessionId);
      const newSession: HistorySession = {
          id: activeSessionId,
          title: userPrompt.slice(0, 20) + (userPrompt.length > 20 ? '...' : ''),
          messages: [],
          lastModified: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };
    
    const aiMessageId = (Date.now() + 1).toString();
    const aiPlaceholder: ChatMessage = {
      id: aiMessageId,
      role: 'model',
      content: '',
      isStreaming: true,
      timestamp: Date.now() + 1,
    };

    const newMessages = [...messages, userMessage, aiPlaceholder];
    setMessages(newMessages);

    if (!sessionRef.current) {
        sessionRef.current = createOptimizerSession(messages);
    }

    try {
      await sessionRef.current.sendMessageStream(userPrompt, (chunk) => {
        setMessages(prev => {
            const updated = prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, content: chunk } : msg
            );
            return updated;
        });
      });
      
      setMessages(prev => {
        const finalMessages = prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        );
        // Save history
        setSessions(currentSessions => {
             const idx = currentSessions.findIndex(s => s.id === activeSessionId);
             if (idx !== -1) {
                 const updated = [...currentSessions];
                 updated[idx] = { ...updated[idx], messages: finalMessages, lastModified: Date.now() };
                 return updated;
             }
             return currentSessions;
        });
        return finalMessages;
      });
      setStatus(OptimizationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(OptimizationStatus.ERROR);
      setError("生成响应失败，请重试。");
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px]"></div>
      </div>

      <HistorySidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        // History Props
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        // Template Props
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onCreateTemplate={handleCreateTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      {/* Template Modal */}
      <TemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        initialTemplate={editingTemplate}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full min-w-0 bg-white/50 backdrop-blur-sm shadow-xl border-l border-slate-200/50 transition-all">
        
        {/* Toggle Sidebar */}
        <div className="absolute top-6 left-4 z-50">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg bg-white/80 border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}
             >
                 {isSidebarOpen ? <XIcon className="w-5 h-5"/> : <MenuIcon className="w-5 h-5"/>}
             </button>
        </div>

        <Header onReset={handleNewChat} />

        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4 pb-20">
               <div className="text-center opacity-80 mb-8">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-md border border-slate-100">
                      <SparklesIcon className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Prompt 炼金术</h3>
                  <p className="max-w-md mx-auto text-sm leading-relaxed text-slate-500">
                    在下方输入您的原始 Prompt 想法，或使用左侧的“我的模板”。<br/>
                    我们将把它转化为专业级指令。
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl animate-[fadeIn_0.5s_ease-out]">
                 {EXAMPLES.map((ex, i) => (
                   <button 
                     key={i}
                     onClick={() => handleOptimize(ex.text)}
                     disabled={status === OptimizationStatus.LOADING}
                     className="text-left p-4 rounded-xl border border-slate-200 bg-white/80 hover:bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <div className="font-semibold text-slate-700 text-sm mb-1 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                        {ex.label}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                          <ArrowRightIcon className="w-4 h-4" />
                        </span>
                     </div>
                     <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ex.text}</div>
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            <div className="flex flex-col pb-4 max-w-4xl mx-auto w-full">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {error && (
                 <div className="mx-auto mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center max-w-md">
                     {error}
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <PromptInput 
          onOptimize={handleOptimize} 
          status={status} 
          externalValue={inputPayload}
          onExternalValueConsumed={() => setInputPayload('')}
        />
      </div>
    </div>
  );
};

export default App;