import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightIcon, PaperclipIcon, XIcon, FileTextIcon } from './Icons';
import { OptimizationStatus, Attachment } from '../types';

// Declare globals for the CDN libraries included in index.html
declare global {
  interface Window {
    mammoth: any;
    XLSX: any;
  }
}

interface PromptInputProps {
  onOptimize: (prompt: string, attachments: Attachment[]) => void;
  status: OptimizationStatus;
  externalValue?: string;
  onExternalValueConsumed?: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  onOptimize, 
  status, 
  externalValue, 
  onExternalValueConsumed 
}) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== '') {
      setValue(externalValue);
      if (onExternalValueConsumed) {
        onExternalValueConsumed();
      }
    }
  }, [externalValue, onExternalValueConsumed]);

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const handleSubmit = () => {
    if ((value.trim() || attachments.length > 0) && status !== OptimizationStatus.LOADING) {
      onOptimize(value, attachments);
      setValue('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Helper: Determine if file is text/code
  const isTextFile = (file: File): boolean => {
      const textTypes = ['text/', 'application/json', 'application/javascript', 'application/x-javascript', 'application/typescript'];
      const textExts = ['.md', '.py', '.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.csv', '.xml', '.java', '.c', '.cpp', '.rs', '.go', '.php'];
      
      if (textTypes.some(t => file.type.startsWith(t))) return true;
      if (textExts.some(ext => file.name.toLowerCase().endsWith(ext))) return true;
      return false;
  };

  // Helper: Read file as Base64 (for Images/PDFs/PPTs)
  const readFileAsBase64 = (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          mimeType: file.type || 'application/octet-stream',
          data: base64String,
          name: file.name
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: Read file as Text (for Code/Text)
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
  };

  // Helper: Read Docx using Mammoth
  const readDocxAsText = async (file: File): Promise<string> => {
    if (!window.mammoth) throw new Error("正在加载文档解析组件，请稍后再试...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (e: any) {
      console.error(e);
      throw new Error("解析 Word 文档失败: " + e.message);
    }
  };

  // Helper: Read Excel using SheetJS
  const readExcelAsText = async (file: File): Promise<string> => {
    if (!window.XLSX) throw new Error("正在加载表格解析组件，请稍后再试...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
      let text = "";
      workbook.SheetNames.forEach((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName];
          const csv = window.XLSX.utils.sheet_to_csv(sheet);
          if (csv.trim()) {
            text += `[工作表: ${sheetName}]\n${csv}\n\n`;
          }
      });
      return text.trim();
    } catch (e: any) {
      console.error(e);
      throw new Error("解析 Excel 文档失败: " + e.message);
    }
  };

  // Process list of files
  const processFiles = async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      let newTextContent = '';
      const newAttachments: Attachment[] = [];
      
      for (const file of fileArray) {
          try {
              if (isTextFile(file)) {
                  // Text/Code -> Append to Prompt Context
                  if (file.size > 2 * 1024 * 1024) { 
                      alert(`文件 ${file.name} 过大，文本模式仅支持 2MB 以下文件。`);
                      continue;
                  }
                  const text = await readFileAsText(file);
                  newTextContent += `\n\n[读取文件: ${file.name}]\n"""\n${text}\n"""\n[文件结束]`;
              
              } else if (file.name.match(/\.(docx|doc)$/i)) {
                  // Word -> Text
                  const text = await readDocxAsText(file);
                  if (text) {
                    newTextContent += `\n\n[读取文档: ${file.name}]\n"""\n${text}\n"""\n[文档结束]`;
                  } else {
                    alert(`文档 ${file.name} 内容为空或无法读取文本。`);
                  }

              } else if (file.name.match(/\.(xlsx|xls)$/i)) {
                  // Excel -> Text (CSV format)
                  const text = await readExcelAsText(file);
                  if (text) {
                    newTextContent += `\n\n[读取表格: ${file.name}]\n"""\n${text}\n"""\n[表格结束]`;
                  } else {
                    alert(`表格 ${file.name} 内容为空。`);
                  }

              } else {
                  // Images/PDFs/PPTs -> Attachments
                  if (file.size > 10 * 1024 * 1024) {
                      alert(`文件 ${file.name} 过大，附件仅支持 10MB 以下文件。`);
                      continue;
                  }
                  const attachment = await readFileAsBase64(file);
                  newAttachments.push(attachment);
              }
          } catch (err: any) {
              console.error(err);
              alert(`处理文件 ${file.name} 失败: ${err.message}`);
          }
      }

      // Update State
      if (newTextContent) {
          setValue(prev => {
              const prefix = prev ? prev + "\n" : "";
              return prefix + newTextContent;
          });
          // Focus after update
          setTimeout(() => {
              if (textareaRef.current) {
                  textareaRef.current.focus();
                  adjustHeight();
              }
          }, 100);
      }

      if (newAttachments.length > 0) {
          setAttachments(prev => [...prev, ...newAttachments]);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
    }
    e.target.value = ''; // Reset input
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFiles(e.dataTransfer.files);
      }
  };

  return (
    <div className="w-full px-4 pb-6 pt-2">
      <div className="max-w-3xl mx-auto relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div 
            className={`relative flex flex-col bg-white rounded-2xl p-2 shadow-xl shadow-indigo-100/50 border transition-all duration-200 overflow-hidden
                ${isDragging ? 'border-indigo-400 ring-4 ring-indigo-50 bg-indigo-50/50' : 'border-slate-100/80'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          {/* Drag Overlay Visual */}
          {isDragging && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm border-2 border-indigo-400 border-dashed rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                 <div className="flex flex-col items-center gap-2 text-indigo-600 pointer-events-none">
                    <PaperclipIcon className="w-8 h-8" />
                    <span className="font-semibold text-sm">释放文件以添加 (Word/Excel/PDF/图片)</span>
                 </div>
            </div>
          )}

          {/* Attachment Preview Area */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pt-2 pb-1">
              {attachments.map((att, index) => (
                <div key={index} className="relative group/att inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg pr-2 py-1 pl-1">
                  {att.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${att.mimeType};base64,${att.data}`} 
                      alt="preview" 
                      className="w-8 h-8 object-cover rounded-md border border-slate-100" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-red-50 text-red-500 rounded-md flex items-center justify-center border border-red-100">
                      <FileTextIcon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs text-slate-600 max-w-[80px] truncate">{att.name || 'File'}</span>
                  <button 
                    onClick={() => removeAttachment(index)}
                    className="p-0.5 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 w-full">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                // Accept Images, PDFs, Office files, and common code/text formats
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
                multiple 
            />
            
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={status === OptimizationStatus.LOADING}
                className="mb-1 ml-1 p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 transform text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 z-10"
                title="上传文件 (支持 Word, Excel, PDF, 图片等)"
            >
                <PaperclipIcon className="w-5 h-5" />
            </button>

            <textarea
                ref={textareaRef}
                className="w-full max-h-[200px] py-3 px-2 bg-transparent text-slate-800 placeholder-slate-400 resize-none focus:outline-none font-sans text-sm leading-relaxed custom-scrollbar relative z-10"
                placeholder={attachments.length > 0 ? "输入对文件的描述或指令..." : "输入您的想法，或拖入文件(Word/Excel/PDF/图片)..."}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === OptimizationStatus.LOADING}
                rows={1}
                style={{ minHeight: '44px' }}
            />
            
            <button
                onClick={handleSubmit}
                disabled={(!value.trim() && attachments.length === 0) || status === OptimizationStatus.LOADING}
                className={`mb-1 mr-1 p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 transform z-10
                ${(!value.trim() && attachments.length === 0) || status === OptimizationStatus.LOADING
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
                {status === OptimizationStatus.LOADING ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <ArrowRightIcon className="w-5 h-5" />
                )}
            </button>
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">支持 Word, Excel, PPT, PDF, 图片及代码文件</span>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;