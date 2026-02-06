import React, { useState, useEffect } from 'react';
import { AISettings, AIProvider } from '../types';
import { XIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

const PROVIDER_PRESETS: Record<AIProvider, Partial<AISettings>> = {
  gemini: {
    baseUrl: '', // Gemini SDK handles this
    model: 'gemini-3-pro-preview',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  moonshot: {
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },
  yi: {
    baseUrl: 'https://api.lingyiwanwu.com/v1',
    model: 'yi-lightning',
  },
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V3',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'google/gemini-2.0-flash-001',
  },
  custom: {
    baseUrl: '',
    model: '',
  }
};

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  moonshot: 'Moonshot (Kimi)',
  yi: 'Yi (零一万物)',
  siliconflow: 'SiliconFlow',
  openrouter: 'OpenRouter',
  custom: '自定义 (Custom)',
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AISettings>(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...settings,
        // Ensure defaults if missing
        temperature: settings.temperature ?? 0.7,
        maxOutputTokens: settings.maxOutputTokens,
        topP: settings.topP ?? 0.95
      });
    }
  }, [isOpen, settings]);

  const handleProviderChange = (provider: AIProvider) => {
    setFormData(prev => ({
      ...prev,
      provider,
      ...PROVIDER_PRESETS[provider],
      // Maintain user's key if possible, but switch endpoints
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">
            AI 模型设置
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择服务商</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProviderChange(p)}
                    className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-all truncate text-center
                      ${formData.provider === p 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'}
                    `}
                    title={PROVIDER_LABELS[p]}
                  >
                    {PROVIDER_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              {/* Base URL */}
              {formData.provider !== 'gemini' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Base URL 
                    {formData.provider === 'custom' && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.baseUrl || ''}
                    onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono text-slate-600"
                    placeholder="https://api.example.com/v1"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    通常以 /v1 结尾。
                  </p>
                </div>
              )}

              {/* Model Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  模型名称 (Model Name)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono text-slate-600"
                  placeholder="e.g. gpt-4o, deepseek-chat"
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  {formData.provider === 'gemini' && "推荐: gemini-3-pro-preview, gemini-2.0-flash"}
                  {formData.provider === 'deepseek' && "推荐: deepseek-chat, deepseek-reasoner"}
                  {formData.provider === 'moonshot' && "推荐: moonshot-v1-8k, moonshot-v1-32k"}
                  {formData.provider === 'yi' && "推荐: yi-lightning, yi-large"}
                  {formData.provider === 'custom' && "请输入服务商提供的模型 ID"}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  API Key
                  {formData.provider !== 'gemini' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="password"
                  required={!process.env.API_KEY || formData.provider !== 'gemini'} 
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono text-slate-600"
                  placeholder="sk-..."
                />
                <p className="text-[10px] text-slate-400 mt-1">
                   Key 仅存储在本地浏览器中，不会发送到我们的服务器。
                   {formData.provider === 'gemini' && process.env.API_KEY && ' (留空则使用默认配置)'}
                </p>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="border-t border-slate-100 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  {showAdvanced ? '隐藏高级参数' : '显示高级参数 (Temperature, Max Tokens)'}
                </button>
              </div>

              {/* Advanced Settings Section */}
              {showAdvanced && (
                <div className="space-y-4 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-[fadeIn_0.3s_ease-out]">
                  
                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-700">随机性 (Temperature): {formData.temperature}</label>
                      <span className="text-[10px] text-slate-400">0 - 2.0</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      值越高越有创意（随机），值越低越严谨（确定）。默认 0.7。
                    </p>
                  </div>

                  {/* Top P */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-700">核采样 (Top P): {formData.topP ?? 0.95}</label>
                      <span className="text-[10px] text-slate-400">0 - 1.0</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formData.topP ?? 0.95}
                      onChange={(e) => setFormData({...formData, topP: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">最大输出长度 (Max Tokens)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxOutputTokens || ''}
                      onChange={(e) => setFormData({...formData, maxOutputTokens: e.target.value ? parseInt(e.target.value) : undefined})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-slate-600"
                      placeholder="留空则使用模型默认值 (通常 4096+)"
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all"
              >
                保存设置
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;