export type PlaygroundMode = 'web' | 'general';

export type SupportedLanguage =
  | 'web'
  | 'python'
  | 'python-ml'
  | 'c'
  | 'cpp'
  | 'java'
  | 'javascript';

export interface LanguageMeta {
  id: SupportedLanguage;
  name: string;
  judge0Id?: number; // Judge0 language ID
  monacoLang: string;
  mode: PlaygroundMode;
  extension: string;
  version: string;
  starterFile: string;
  defaultCode: string;
}

export interface CodeProjectFiles {
  html?: string;
  css?: string;
  js?: string;
  main?: string;
}

export interface CodeProject {
  id: string;
  uid: string;
  title: string;
  language: SupportedLanguage;
  mode: PlaygroundMode;
  files: CodeProjectFiles;
  stdin?: string;
  lessonId?: string;
  courseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionRequest {
  languageId: number;
  sourceCode: string;
  stdin?: string;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null; // e.g. "0.04"
  memory: number | null; // KB
  status: {
    id: number;
    description: string;
  };
  exitCode?: number;
  provider?: 'judge0' | 'pyodide' | 'local';
}

export interface ConsoleLogItem {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
  timestamp: string;
}

export interface EditorSettings {
  fontSize: number;
  theme: 'vs-dark' | 'light';
  wordWrap: 'on' | 'off';
  minimap: boolean;
  tabSize: number;
}

