
export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
  name?: string;
}

export interface OptimizationRequest {
  rawPrompt: string;
  attachments?: Attachment[];
}

export interface OptimizationResult {
  optimizedPrompt: string;
  timestamp: number;
}

export enum OptimizationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: Attachment[]; // Add attachments support
  isStreaming?: boolean;
  timestamp: number;
}

export interface HistorySession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  lastModified: number;
}

export type AIProvider = 'gemini' | 'openai' | 'deepseek' | 'moonshot' | 'yi' | 'siliconflow' | 'openrouter' | 'custom';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxOutputTokens?: number;
  topP?: number;
}