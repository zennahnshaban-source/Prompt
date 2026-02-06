import { GoogleGenAI, GenerateContentResponse, Chat, Content, Part } from "@google/genai";
import { ChatMessage, AISettings, Attachment } from "../types";

const SYSTEM_INSTRUCTION = `
你现在的身份是 **首席 Prompt 架构师 (Chief Prompt Architect)**，精通 LLM 原理与 Prompt Engineering 高级方法论（如 CO-STAR, CRISPE, Few-Shot, Chain-of-Thought）。

你的核心任务是：将用户模糊、简单的需求，重构为**企业级、高鲁棒性、逻辑严密**的结构化 Prompt。

**全局核心约束（最高优先级）：**
1. **强制中文输出**：除非用户明确要求英文，否则所有指令、描述、逻辑必须使用**中文**。
   - *特例*：保留技术术语（如 Python, JSON, SQL, Midjourney）。
2. **纯净文本格式**：
   - **严禁使用星号（*）**：绝对不要出现 \`*\` 或 \`**\`。
   - **严禁使用 Markdown 代码块**：不要用 \`\`\` 包裹整个输出。
   - **列表格式**：仅使用连字符（-）或数字（1.）。
   - **章节区分**：使用 \`【标题】\`、\`>>>\` 或全大写字母。

**Prompt 工程化标准（你生成的 Prompt 必须具备的要素）：**

1.  **角色沉浸 (Persona)**：不仅仅是“你是一个XXX”，要包含该角色的思维模式、擅长技能和潜在偏见。
2.  **思维链 (Chain of Thought)**：在 Prompt 中必须显式要求 AI “深呼吸，一步步思考”，以激活模型的推理能力。
3.  **防御性分隔符 (Delimiters)**：对于用户未来要输入的数据，必须在 Prompt 中规定使用分隔符（如 \`"""\` 或 \`###\`）进行包裹，以区分指令与数据。
4.  **结构化输出 (Structured Output)**：明确指定输出的格式（JSON, Markdown 表格, 特定文风）。

**工作流模式：**

**模式一：深度重构 (Initial Optimization)**
当用户提出新需求时，输出一个完整的结构化 Prompt，结构如下（请严格保持此结构）：

【角色设定】
定义专家的核心能力、语调风格、深层动机。

【任务背景】
解释为什么要执行此任务，提供上下文环境。

【核心任务】
使用动词开头的清晰指令。

【思维与执行步骤】
1. 分析输入的数据...
2. 思考关键点...
3. 执行生成...
(必须包含“请一步步进行逻辑推理”的指令)

【约束条件】
- 否定约束（不要做什么）
- 长度/格式限制
- 风格要求

【数据输入格式】
指导用户如何输入数据（例如：“请将内容放入三个引号之间”）。

【输出示例/少样本】
(如果适用，提供一个理想的输入输出对，或者预留占位符)

---

**模式二：迭代微调 (Iterative Refinement)**
当用户要求修改（如“更专业一点”、“增加字数”）时：
1. **全量重写**：不要只给补丁。必须重新输出包含修改内容的**完整 Prompt**。
2. **逻辑自洽**：确保新加入的限制与原有逻辑不冲突。
3. **去除冗余**：如果是微调，可以简化“角色设定”部分的描述长度，但必须保留核心定义，重点优化【任务】和【约束】模块。

**示例演示：**
用户输入：“帮我写个 Python 脚本处理 Excel。”
你的输出不应只是：“好的写个脚本。”
而应该是：“【角色设定】你是一名资深 Python 数据工程师... 【任务】编写高效率、带注释的 Pandas 脚本... 【约束】必须处理文件不存在的异常... 【格式】使用 Markdown 代码块...”
`;

// Interface for unified AI Session
export interface IAISession {
  sendMessageStream(message: string, attachments: Attachment[], onChunk: (text: string) => void): Promise<string>;
}

// Helper to generate a short title (Non-streaming)
export const generateChatTitle = async (firstMessage: string, settings: AISettings): Promise<string> => {
  const prompt = `请将以下用户输入总结为一个极简短的标题（10个汉字以内），用于历史记录列表。不要包含标点符号，不要包含“关于”、“请求”等冗余词汇。直接输出标题内容。\n\n用户输入：${firstMessage}`;

  try {
    if (settings.provider === 'gemini') {
      const apiKey = settings.apiKey || process.env.API_KEY;
      if (!apiKey) return firstMessage.slice(0, 20);

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: settings.model || 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "你是一个专业的摘要助手。",
          temperature: settings.temperature,
        }
      });
      
      const title = response.text;
      return title ? title.trim().replace(/^["']|["']$/g, '') : firstMessage.slice(0, 20);
    } else {
      // OpenAI Compatible
      if (!settings.apiKey || !settings.baseUrl) return firstMessage.slice(0, 20);

      const baseUrl = settings.baseUrl?.replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: '你是一个专业的摘要助手。' },
            { role: 'user', content: prompt }
          ],
          stream: false,
          max_tokens: 50,
          temperature: settings.temperature,
        }),
      });

      if (!response.ok) return firstMessage.slice(0, 20);
      const data = await response.json();
      const title = data.choices?.[0]?.message?.content;
      return title ? title.trim().replace(/^["']|["']$/g, '') : firstMessage.slice(0, 20);
    }
  } catch (error) {
    console.error("Title generation failed:", error);
    return firstMessage.slice(0, 20);
  }
};

// --- Implementation 1: Google Gemini (Official SDK) ---
class GeminiSession implements IAISession {
  private chat: Chat;

  constructor(settings: AISettings, historyMessages: ChatMessage[]) {
    // Use environment key if settings key is empty
    const apiKey = settings.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing for Gemini");

    const ai = new GoogleGenAI({ apiKey });

    // Convert ChatMessage history to Gemini Content format
    const history: Content[] = historyMessages.map(msg => {
      const parts: Part[] = [{ text: msg.content }];
      
      // Add historical attachments if they exist
      if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(att => {
              parts.push({
                  inlineData: {
                      mimeType: att.mimeType,
                      data: att.data
                  }
              });
          });
      }
      
      return {
        role: msg.role,
        parts: parts
      };
    });

    this.chat = ai.chats.create({
      model: settings.model || 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: settings.maxOutputTokens || 32768,
        temperature: settings.temperature,
        topP: settings.topP,
        thinkingConfig: settings.model.includes('thinking') || settings.model.includes('pro') ? {
          thinkingBudget: 4096, 
        } : undefined
      },
    });
  }

  async sendMessageStream(message: string, attachments: Attachment[], onChunk: (text: string) => void): Promise<string> {
    try {
      // Construct parts for the current message
      const parts: Part[] = [];
      
      // Add text part (if exists)
      if (message) {
        parts.push({ text: message });
      }

      // Add attachments
      if (attachments && attachments.length > 0) {
          attachments.forEach(att => {
             parts.push({
                 inlineData: {
                     mimeType: att.mimeType,
                     data: att.data
                 }
             });
          });
      }

      // Send (if just attachments, message might be empty, which Gemini supports via parts)
      const resultStream = await this.chat.sendMessageStream({ message: parts });
      
      let fullText = '';
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullText += text;
          onChunk(fullText);
        }
      }
      return fullText;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}

// --- Implementation 2: OpenAI Compatible (Fetch / SSE) ---
class OpenAICompatibleSession implements IAISession {
  private settings: AISettings;
  private history: any[];

  constructor(settings: AISettings, historyMessages: ChatMessage[]) {
    this.settings = settings;
    if (!this.settings.apiKey) throw new Error("API Key is missing");
    if (!this.settings.baseUrl) throw new Error("Base URL is missing");

    this.history = historyMessages.map(msg => this.formatMessage(msg.role, msg.content, msg.attachments));
  }

  // Helper to format messages for OpenAI API (support Vision)
  private formatMessage(role: string, content: string, attachments?: Attachment[]) {
    const apiRole = role === 'model' ? 'assistant' : 'user';
    
    // Simple text message
    if (!attachments || attachments.length === 0) {
        return { role: apiRole, content: content };
    }

    // Multimodal message (array content)
    const contentParts: any[] = [];
    
    if (content) {
        contentParts.push({ type: 'text', text: content });
    }

    attachments.forEach(att => {
        if (att.mimeType.startsWith('image/')) {
            contentParts.push({
                type: 'image_url',
                image_url: {
                    url: `data:${att.mimeType};base64,${att.data}`
                }
            });
        } 
        // Note: Standard OpenAI Vision doesn't strictly support PDF via image_url, 
        // but some proxies might, or we just ignore non-images here to prevent 400 errors.
        // For strict OpenAI, we'd need to convert PDF pages to images. 
        // For now, we skip non-image attachments for OpenAI-compatible to ensure stability.
    });

    return { role: apiRole, content: contentParts };
  }

  async sendMessageStream(message: string, attachments: Attachment[], onChunk: (text: string) => void): Promise<string> {
    const newMessage = this.formatMessage('user', message, attachments);
    
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...this.history,
      newMessage
    ];

    try {
      const baseUrl = this.settings.baseUrl?.replace(/\/+$/, '');
      const url = `${baseUrl}/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`,
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: messages,
          stream: true,
          temperature: this.settings.temperature,
          max_tokens: this.settings.maxOutputTokens,
          top_p: this.settings.topP,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      if (!response.body) throw new Error("Response body is empty");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; 

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || data.choices?.[0]?.delta?.reasoning_content || ''; 
            if (content) {
              fullText += content;
              onChunk(fullText);
            }
          } catch (e) {
            console.warn("Failed to parse SSE JSON:", e);
          }
        }
      }

      // Update internal history
      this.history.push(newMessage);
      this.history.push({ role: 'assistant', content: fullText });

      return fullText;

    } catch (error) {
      console.error("OpenAI Compatible API Error:", error);
      throw error;
    }
  }
}

export const createAISession = (
  history: ChatMessage[] = [],
  settings?: AISettings
): IAISession => {
  if (!settings || settings.provider === 'gemini') {
    return new GeminiSession(
      settings || { 
        provider: 'gemini', 
        apiKey: '', 
        model: 'gemini-3-pro-preview', 
        temperature: 0.7 
      }, 
      history
    );
  }
  return new OpenAICompatibleSession(settings, history);
};

export type { IAISession as OptimizerSession };