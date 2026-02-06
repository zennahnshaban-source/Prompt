# Prompt 炼金术 (Prompt Alchemy)

**Prompt 炼金术** 是一款基于 Google **Gemini 3 Pro** 模型的专业级提示词（Prompt）优化工具。它致力于将用户模糊、简单的原始想法，转化为逻辑严密、结构清晰、高鲁棒性的企业级 AI 指令。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![Gemini](https://img.shields.io/badge/Model-Gemini%203%20Pro-8E75B2.svg)

## ✨ 核心功能

### 1. 智能 Prompt 优化
内置“首席 Prompt 架构师”角色，基于 CO-STAR、CRISPE 和思维链（Chain-of-Thought）等高级工程化方法论，自动将您的输入重构为包含以下要素的结构化指令：
- **角色沉浸 (Persona)**
- **任务背景 (Context)**
- **核心任务 (Task)**
- **思维链步骤 (Step-by-Step Logic)**
- **防御性约束 (Constraints)**

### 2. 多模态文件支持 (Multimodal Support) 📁
支持直接上传多种格式的文件作为上下文，AI 可以“看”懂您的文件：
- **图像识别**：支持 PNG, JPG, WEBP 等图片格式，让 AI 基于画面生成提示词。
- **文档解析**：内置浏览器端解析引擎，自动提取 **Word (.docx)** 和 **Excel (.xlsx)** 的文本内容。
- **代码与文本**：直接读取 PDF, PPT, TXT, MD, JSON, Python, JS 等代码文件。
- **交互便捷**：支持拖拽上传、文件预览。

### 3. 对话式迭代
支持多轮对话上下文。如果初次生成的 Prompt 不完美，您可以像与人交谈一样提出修改意见（例如：“语气再正式一点”、“增加字数限制”），AI 会在保持原有逻辑的基础上进行精准微调。

### 4. 历史记录管理
- 自动保存所有对话会话。
- 支持侧边栏快速切换历史记录。
- 本地持久化存储，刷新页面不丢失数据。

### 5. 自定义模板系统 (Prompt Templates) 🧩
- **创建模板**：保存您常用的 Prompt 结构（支持 `{{变量}}` 占位符）。
- **快速复用**：点击模板即可快速填充到输入框，极大提升工作效率。
- **管理便捷**：支持模板的编辑与删除。

### 6. 现代化 UI/UX
- **流式响应**：极速体验，无需等待完整生成。
- **响应式设计**：完美适配桌面端与移动端。
- **沉浸式体验**：优雅的毛玻璃效果与流畅的动画交互。

## 🛠️ 技术栈

- **前端框架**: [React 19](https://react.dev/)
- **样式库**: [Tailwind CSS](https://tailwindcss.com/)
- **AI SDK**: [@google/genai](https://www.npmjs.com/package/@google/genai)
- **文档解析**: [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (Word), [SheetJS](https://sheetjs.com/) (Excel)
- **图标库**: 自定义 SVG 图标组件
- **构建工具**: ESBuild (通过 WebContainer 环境)

## 🚀 快速开始

### 前置要求
- Node.js 18+
- 有效的 Google Gemini API Key

### 安装与运行

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/prompt-alchemy.git
   cd prompt-alchemy
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 API Key**
   本项目依赖 `process.env.API_KEY`。在本地运行时，请确保环境变量中包含您的 Gemini API Key，或者在构建工具的配置中注入。

4. **启动应用**
   ```bash
   npm start
   ```

## 📖 使用指南

1. **输入想法**：在底部的输入框中输入您想要让 AI 完成的任务，或者直接**拖入图片/文档**作为参考。
2. **获取优化结果**：AI 会结合您的文字描述和文件内容，生成一个结构化的 Prompt。
3. **微调**：在输入框中继续输入修改建议（例如：“基于上传的 Excel 表格结构写一个 Python 处理脚本”）。
4. **保存模板**：如果您发现某个 Prompt 结构很好用，点击左侧菜单的“我的模板” -> “新建模板”进行保存。
5. **复制使用**：点击对话气泡右上角的“复制”按钮，将优化后的 Prompt 粘贴到 ChatGPT、Claude 或 Gemini 中使用。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目！

## 📄 许可证

MIT License