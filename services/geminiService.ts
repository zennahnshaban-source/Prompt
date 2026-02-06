import { GoogleGenAI, GenerateContentResponse, Chat, Content } from "@google/genai";
import { ChatMessage } from "../types";

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

// Initialize the client. API Key is injected via environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class OptimizerSession {
  private chat: Chat;

  constructor(historyMessages: ChatMessage[] = []) {
    // Convert app ChatMessage format to Gemini SDK Content format
    const history: Content[] = historyMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Use 'gemini-3-pro-preview' for complex text tasks like prompt engineering and reasoning.
    this.chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Increase output token limit to prevent truncation on long prompts
        maxOutputTokens: 32768,
        // Enable thinking to improve reasoning capabilities for complex prompt optimization
        thinkingConfig: {
          thinkingBudget: 4096, 
        }
      },
    });
  }

  async sendMessageStream(
    message: string, 
    onChunk: (text: string) => void
  ): Promise<string> {
    try {
      const resultStream = await this.chat.sendMessageStream({ message });
      
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
      console.error("Gemini Optimization Error:", error);
      throw error;
    }
  }
}

export const createOptimizerSession = (history?: ChatMessage[]) => new OptimizerSession(history);