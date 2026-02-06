
export interface OptimizationRequest {
  rawPrompt: string;
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
