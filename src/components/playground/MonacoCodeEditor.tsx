import React, { useRef } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import {
  FileCode,
  FileText,
  Code2,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Settings,
  WrapText,
  ZoomIn,
  ZoomOut,
  FolderOpen,
} from 'lucide-react';
import type { EditorSettings } from '@/types/playground';

interface MonacoCodeEditorProps {
  code: string;
  language: string;
  fileName: string;
  fileIcon?: 'html' | 'css' | 'js' | 'python' | 'c' | 'cpp' | 'java' | 'code';
  settings: EditorSettings;
  onChange: (val: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  tabs?: Array<{
    id: string;
    label: string;
    icon: 'html' | 'css' | 'js' | 'python' | 'c' | 'cpp' | 'java' | 'code';
    badgeColor?: string;
  }>;
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  readOnly?: boolean;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  language,
  fileName,
  fileIcon = 'code',
  settings,
  onChange,
  onRun,
  onSave,
  onReset,
  tabs,
  activeTabId,
  onTabChange,
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Define a custom LearnSpace VS Code Dark Theme
    monaco.editor.defineTheme('learnspace-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#f0f6fc',
        'editor.lineHighlightBackground': '#161b22',
        'editorCursor.foreground': '#58a6ff',
        'editor.selectionBackground': '#264f78',
        'editorIndentGuide.background1': '#21262d',
        'editorIndentGuide.activeBackground1': '#388bfd',
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register Ctrl+Enter / Cmd+Enter to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // Register Ctrl+S / Cmd+S to Save Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });
  };

  const renderFileIcon = (icon: string) => {
    switch (icon) {
      case 'html':
        return (
          <span className="w-3.5 h-3.5 rounded bg-[#e34f26] text-white font-black text-[8px] flex items-center justify-center shrink-0">
            5
          </span>
        );
      case 'css':
        return (
          <span className="w-3.5 h-3.5 rounded bg-[#1572b6] text-white font-black text-[8px] flex items-center justify-center shrink-0">
            3
          </span>
        );
      case 'js':
        return (
          <span className="w-3.5 h-3.5 rounded bg-[#f7df1e] text-black font-black text-[8px] flex items-center justify-center shrink-0">
            JS
          </span>
        );
      case 'python':
        return <span className="text-sm shrink-0">🐍</span>;
      case 'c':
        return <span className="text-[10px] font-bold text-blue-400 shrink-0">C</span>;
      case 'cpp':
        return <span className="text-[10px] font-bold text-blue-400 shrink-0">C++</span>;
      case 'java':
        return <span className="text-sm shrink-0">☕</span>;
      default:
        return <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#c9d1d9] overflow-hidden select-none">
      {/* VS Code Tab Bar */}
      <div className="h-9 bg-[#010409] border-b border-[#21262d] flex items-center justify-between px-2 overflow-x-auto shrink-0 scrollbar-none">
        {/* Left Tabs List */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {tabs && tabs.length > 0 ? (
            tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`h-9 px-3.5 flex items-center gap-2 text-xs font-medium border-r border-[#21262d] border-t-2 transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#0d1117] text-[#f0f6fc] border-t-[#388bfd]'
                      : 'bg-[#010409] text-[#8b949e] border-t-transparent hover:bg-[#0d1117] hover:text-[#c9d1d9]'
                  }`}
                >
                  {renderFileIcon(tab.icon)}
                  <span>{tab.label}</span>
                </button>
              );
            })
          ) : (
            <div className="h-9 px-3.5 flex items-center gap-2 text-xs font-medium bg-[#0d1117] text-[#f0f6fc] border-r border-[#21262d] border-t-2 border-t-[#388bfd]">
              {renderFileIcon(fileIcon)}
              <span>{fileName}</span>
            </div>
          )}
        </div>

        {/* Quick Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8b949e] pr-2">
          <span>workspace</span>
          <span>&gt;</span>
          <span className="text-[#c9d1d9] font-mono">{fileName}</span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          theme="learnspace-dark"
          language={language}
          value={code}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={(value) => onChange(value || '')}
          options={{
            readOnly,
            fontSize: settings.fontSize,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            wordWrap: settings.wordWrap,
            minimap: { enabled: settings.minimap },
            tabSize: settings.tabSize,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
          }}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-[#0d1117] text-[#8b949e] text-xs">
              <span>Loading Monaco Editor...</span>
            </div>
          }
        />
      </div>

      {/* Status Bar (VS Code Bottom Bar) */}
      <div className="h-6 bg-[#090d16] border-t border-[#21262d] px-3 flex items-center justify-between text-[11px] text-[#8b949e] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#58a6ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Monaco Ready</span>
          </span>
          <span className="text-[#30363d]">•</span>
          <span>UTF-8</span>
          <span className="text-[#30363d]">•</span>
          <span>Spaces: {settings.tabSize}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[10px] text-[#6e7681]">
            Press <kbd className="bg-[#161b22] px-1 py-0.5 rounded border border-[#30363d] text-slate-300">Ctrl+Enter</kbd> to Run
          </span>
          <span className="text-[#388bfd] font-semibold">{language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

