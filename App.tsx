import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChatBubble from './components/ChatBubble';
import HistorySidebar from './components/HistorySidebar';
import TemplateModal from './components/TemplateModal';
import SettingsModal from './components/SettingsModal';
import { createAISession, OptimizerSession, generateChatTitle } from './services/geminiService';
import { OptimizationStatus, ChatMessage, HistorySession, PromptTemplate, AISettings, Attachment } from './types';
import { SparklesIcon, MenuIcon, XIcon, ArrowRightIcon, SidebarIcon } from './components/Icons';

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
const SETTINGS_STORAGE_KEY = 'prompt_alchemy_settings';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  apiKey: '', // Defaults to env if empty in service
  model: 'gemini-3-pro-preview',
  temperature: 0.7,
};

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

  // --- Settings State ---
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
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

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    // Reset session when settings change to force new config
    sessionRef.current = null;
  }, [settings]);

  // --- Initial Session ---
  useEffect(() => {
    if (!sessionRef.current) {
        sessionRef.current = createAISession([], settings);
    }
  }, [settings]);

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
    sessionRef.current = createAISession([], settings); 
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectSession = (session: HistorySession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setStatus(OptimizationStatus.SUCCESS);
    setError(null);
    sessionRef.current = createAISession(session.messages, settings);
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
  const handleOptimize = async (userPrompt: string, attachments: Attachment[] = []) => {
    setStatus(OptimizationStatus.LOADING);
    setError(null);

    let activeSessionId = currentSessionId;
    let isNewSession = false;

    if (!activeSessionId) {
      isNewSession = true;
      activeSessionId = Date.now().toString();
      setCurrentSessionId(activeSessionId);
      const newSession: HistorySession = {
          id: activeSessionId,
          // Initial temp title, will be updated by AI
          title: userPrompt ? (userPrompt.slice(0, 20) + (userPrompt.length > 20 ? '...' : '')) : '新对话',
          messages: [],
          lastModified: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      attachments: attachments, // Store attachments
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

    // Ensure session is created with latest messages and settings
    if (!sessionRef.current) {
        sessionRef.current = createAISession(newMessages.slice(0, -1), settings);
    }

    // Trigger title generation in background for new sessions (only if text exists)
    if (isNewSession && userPrompt) {
      generateChatTitle(userPrompt, settings).then((aiTitle) => {
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, title: aiTitle } 
            : s
        ));
      }).catch(err => {
        console.warn("Failed to generate AI title", err);
      });
    }

    try {
      await sessionRef.current.sendMessageStream(userPrompt, attachments, (chunk) => {
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
      setError(err.message || "生成响应失败，请检查设置或网络连接。");
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* Background ambient glow - Subtler */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-100/40 rounded-full blur-[150px]"></div>
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
        // Settings Props
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Modals */}
      <TemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        initialTemplate={editingTemplate}
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full min-w-0 bg-white/30 backdrop-blur-sm transition-all">
        
        {/* Toggle Sidebar Button for Mobile and Desktop */}
        <div className="absolute top-4 left-4 z-50">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 rounded-xl bg-white/90 border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
                title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
             >
                 {isSidebarOpen ? <SidebarIcon className="w-5 h-5"/> : <SidebarIcon className="w-5 h-5 opacity-70"/>}
             </button>
        </div>

        <Header 
          onReset={handleNewChat} 
          settings={settings}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-6" id="chat-container">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20">
                 <div className="text-center mb-10 relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-full blur-xl"></div>
                    <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-indigo-100 border border-indigo-50 transform rotate-3 transition-transform hover:rotate-0 duration-500">
                        <SparklesIcon className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Prompt 炼金术</h3>
                    <p className="max-w-md mx-auto text-base text-slate-500 leading-relaxed">
                      将您的原始想法转化为<span className="text-indigo-600 font-medium">企业级 AI 指令</span>。<br/>
                      支持 Claude, ChatGPT, Gemini, DeepSeek 等主流模型。
                    </p>
                    {/* Badge removed here as it is now in Header */}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl animate-[fadeIn_0.5s_ease-out]">
                   {EXAMPLES.map((ex, i) => (
                     <button 
                       key={i}
                       onClick={() => handleOptimize(ex.text)}
                       disabled={status === OptimizationStatus.LOADING}
                       className="text-left p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <div className="font-semibold text-slate-700 text-sm mb-2 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                          {ex.label}
                          <span className="text-indigo-200 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1 duration-300">
                            <ArrowRightIcon className="w-4 h-4" />
                          </span>
                       </div>
                       <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed opacity-80">{ex.text}</div>
                     </button>
                   ))}
                 </div>
              </div>
            ) : (
              <div className="flex flex-col pb-4 w-full">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {error && (
                   <div className="mx-auto mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center max-w-md shadow-sm">
                       {error}
                   </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </main>

        <div className="flex-shrink-0">
            <PromptInput 
              onOptimize={handleOptimize} 
              status={status} 
              externalValue={inputPayload}
              onExternalValueConsumed={() => setInputPayload('')}
            />
        </div>
      </div>
    </div>
  );
};

export default App;