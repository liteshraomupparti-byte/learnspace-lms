import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Maximize2,
  Minimize2,
  FolderOpen,
  ChevronDown,
  Sparkles,
  Check,
  AlertTriangle,
  Info,
  Terminal,
  Eye,
  ArrowLeft,
  X,
  Code2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MonacoCodeEditor } from '@/components/playground/MonacoCodeEditor';
import { WebPreviewPanel } from '@/components/playground/WebPreviewPanel';
import { TerminalOutputPanel } from '@/components/playground/TerminalOutputPanel';
import { ProjectManagerModal } from '@/components/playground/ProjectManagerModal';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_WEB_FILES,
} from '@/data/playgroundLanguages';
import { projectService } from '@/services/projectService';
import { codeExecutionService } from '@/services/codeExecutionService';
import type {
  SupportedLanguage,
  PlaygroundMode,
  CodeProject,
  CodeProjectFiles,
  ExecutionResult,
  EditorSettings,
} from '@/types/playground';

export const PlaygroundPage: React.FC = () => {
  const { currentUser, firebaseUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query params (e.g. from a lesson)
  const initialLangParam = searchParams.get('lang') as SupportedLanguage | null;
  const lessonIdParam = searchParams.get('lessonId');
  const courseIdParam = searchParams.get('courseId');
  const lessonTitleParam = searchParams.get('lessonTitle');

  const uid = firebaseUser?.uid || currentUser?.uid || null;

  // Selected Language & Mode
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    initialLangParam && SUPPORTED_LANGUAGES.some((l) => l.id === initialLangParam)
      ? initialLangParam
      : 'web'
  );
  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const mode: PlaygroundMode = currentLangMeta.mode;

  // Active Tab for Web Mode ('html' | 'css' | 'js')
  const [activeWebTab, setActiveWebTab] = useState<'html' | 'css' | 'js'>('html');

  // File buffers
  const [webFiles, setWebFiles] = useState<CodeProjectFiles>({
    html: DEFAULT_WEB_FILES.html,
    css: DEFAULT_WEB_FILES.css,
    js: DEFAULT_WEB_FILES.js,
  });

  const [generalCode, setGeneralCode] = useState<string>(currentLangMeta.defaultCode);
  const [stdin, setStdin] = useState<string>('');

  // Active Project state
  const [currentProject, setCurrentProject] = useState<CodeProject | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>(
    lessonTitleParam ? `Lesson Lab: ${lessonTitleParam}` : `My ${currentLangMeta.name} Project`
  );
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Layout & UI controls
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'output'>('editor');

  // Split pane sizing (percentage for left editor pane)
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(52);
  const isResizingRef = useRef(false);

  // Editor configuration preferences
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => {
    try {
      const stored = localStorage.getItem('learnspace_editor_settings');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      fontSize: 14,
      theme: 'vs-dark',
      wordWrap: 'on',
      minimap: false,
      tabSize: 2,
    };
  });

  // Save settings in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('learnspace_editor_settings', JSON.stringify(editorSettings));
    } catch {}
  }, [editorSettings]);

  // Handle URL change or initial lesson load
  useEffect(() => {
    if (initialLangParam && SUPPORTED_LANGUAGES.some((l) => l.id === initialLangParam)) {
      handleLanguageChange(initialLangParam);
    }
  }, [initialLangParam]);

  // Handle Window resizing / dragging split pane
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const totalWidth = window.innerWidth;
      const newPercent = Math.min(Math.max((e.clientX / totalWidth) * 100, 25), 75);
      setEditorWidthPercent(newPercent);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Language change handler
  const handleLanguageChange = (newLangId: SupportedLanguage) => {
    const targetMeta = SUPPORTED_LANGUAGES.find((l) => l.id === newLangId);
    if (!targetMeta) return;

    setSelectedLanguage(newLangId);
    setIsLanguageDropdownOpen(false);
    setExecutionResult(null);

    // If switching language on an unsaved scratchpad, load default template
    if (!currentProject || currentProject.language !== newLangId) {
      if (targetMeta.mode === 'web') {
        setWebFiles({
          html: DEFAULT_WEB_FILES.html,
          css: DEFAULT_WEB_FILES.css,
          js: DEFAULT_WEB_FILES.js,
        });
      } else {
        setGeneralCode(targetMeta.defaultCode);
      }
      setProjectTitle(`My ${targetMeta.name} Project`);
      setCurrentProject(null);
      setIsSaved(true);
    }
  };

  // Code change handlers
  const handleEditorCodeChange = (newVal: string) => {
    setIsSaved(false);
    if (mode === 'web') {
      setWebFiles((prev) => ({
        ...prev,
        [activeWebTab]: newVal,
      }));
    } else {
      setGeneralCode(newVal);
    }
  };

  // Current active code string for Monaco
  const currentCode =
    mode === 'web'
      ? webFiles[activeWebTab] || ''
      : generalCode;

  // Current file name & icon for Monaco
  const currentFileName =
    mode === 'web'
      ? activeWebTab === 'html'
        ? 'index.html'
        : activeWebTab === 'css'
        ? 'styles.css'
        : 'script.js'
      : currentLangMeta.starterFile;

  const currentFileIcon =
    mode === 'web'
      ? activeWebTab
      : currentLangMeta.monacoLang === 'python'
      ? 'python'
      : currentLangMeta.monacoLang === 'c'
      ? 'c'
      : currentLangMeta.monacoLang === 'cpp'
      ? 'cpp'
      : currentLangMeta.monacoLang === 'java'
      ? 'java'
      : 'code';

  // Run Code execution handler
  const handleRunCode = async () => {
    if (isRunning) return;

    // Switch mobile view to output so student sees results immediately
    setMobileActiveView('output');

    if (mode === 'web') {
      // In web mode, updating state triggers the iframe re-render in WebPreviewPanel
      setIsRunning(true);
      setTimeout(() => {
        setIsRunning(false);
      }, 350);
      return;
    }

    // General Mode (Python, C, C++, Java, Node.js)
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const result = await codeExecutionService.runCode(
        selectedLanguage,
        currentLangMeta.judge0Id,
        generalCode,
        stdin
      );
      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult({
        stdout: null,
        stderr: err.message || 'Execution error encountered.',
        compile_output: null,
        time: null,
        memory: null,
        status: { id: 13, description: 'Internal Execution Error' },
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Reset code handler
  const handleResetCode = () => {
    if (mode === 'web') {
      setWebFiles({
        html: DEFAULT_WEB_FILES.html,
        css: DEFAULT_WEB_FILES.css,
        js: DEFAULT_WEB_FILES.js,
      });
    } else {
      setGeneralCode(currentLangMeta.defaultCode);
    }
    setStdin('');
    setExecutionResult(null);
    setIsSaved(true);
    setResetConfirmOpen(false);
  };

  // Save Project handler
  const handleSaveProject = async () => {
    try {
      const files: CodeProjectFiles =
        mode === 'web'
          ? { html: webFiles.html, css: webFiles.css, js: webFiles.js }
          : { main: generalCode };

      const saved = await projectService.saveProject(
        uid || 'guest',
        {
          title: projectTitle.trim() || `My ${currentLangMeta.name} Project`,
          language: selectedLanguage,
          mode,
          files,
          stdin,
          lessonId: lessonIdParam || undefined,
          courseId: courseIdParam || undefined,
        },
        currentProject?.id
      );

      setCurrentProject(saved);
      setIsSaved(true);
      setSaveStatusMsg('Project saved successfully!');
      setTimeout(() => setSaveStatusMsg(null), 2500);
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setSaveStatusMsg('Failed to save project.');
      setTimeout(() => setSaveStatusMsg(null), 3000);
    }
  };

  // Select project from modal
  const handleSelectProject = (project: CodeProject) => {
    setCurrentProject(project);
    setSelectedLanguage(project.language);
    setProjectTitle(project.title);
    setStdin(project.stdin || '');

    if (project.mode === 'web') {
      setWebFiles({
        html: project.files.html || DEFAULT_WEB_FILES.html,
        css: project.files.css || DEFAULT_WEB_FILES.css,
        js: project.files.js || DEFAULT_WEB_FILES.js,
      });
      setActiveWebTab('html');
    } else {
      setGeneralCode(project.files.main || '');
    }

    setExecutionResult(null);
    setIsSaved(true);
  };

  // Create new project from modal
  const handleCreateNewProject = (lang: SupportedLanguage, title: string) => {
    const meta = SUPPORTED_LANGUAGES.find((l) => l.id === lang) || SUPPORTED_LANGUAGES[0];
    setSelectedLanguage(lang);
    setProjectTitle(title);
    setCurrentProject(null);
    setStdin('');

    if (meta.mode === 'web') {
      setWebFiles({
        html: DEFAULT_WEB_FILES.html,
        css: DEFAULT_WEB_FILES.css,
        js: DEFAULT_WEB_FILES.js,
      });
      setActiveWebTab('html');
    } else {
      setGeneralCode(meta.defaultCode);
    }

    setExecutionResult(null);
    setIsSaved(false);
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#0b0f19] text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[calc(100vh-64px)] w-full'
      } overflow-hidden select-none font-sans`}
    >
      {/* Lesson deep-link banner if opened from a course lesson */}
      {lessonTitleParam && (
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 px-4 py-2 border-b border-blue-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider text-[10px]">
              Lesson Lab
            </span>
            <span className="text-slate-200 font-medium truncate max-w-md">
              {lessonTitleParam}
            </span>
          </div>
          {courseIdParam && lessonIdParam && (
            <button
              onClick={() => navigate(`/learn/${courseIdParam}/lesson/${lessonIdParam}`)}
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition"
            >
              <ArrowLeft size={13} />
              <span>Back to Lesson</span>
            </button>
          )}
        </div>
      )}

      {/* Top Professional Header Bar (matching reference screenshot style) */}
      <header className="h-14 bg-[#111827] border-b border-[#1f293d] px-4 flex items-center justify-between shrink-0 relative z-20">
        {/* Left Side: Language Dropdown Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#283548] border border-[#334155] text-white text-sm font-semibold transition"
            >
              <span>{currentLangMeta.name}</span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  isLanguageDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Language Selector Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsLanguageDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 text-slate-800 animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Select Language Mode
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = lang.id === selectedLanguage;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              lang.mode === 'web' ? 'bg-orange-500' : 'bg-blue-500'
                            }`}
                          />
                          <span>{lang.name}</span>
                        </div>
                        {isSelected && <Check size={16} className="text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Project Title and Save indicator */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#24334a]">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => {
                setProjectTitle(e.target.value);
                setIsSaved(false);
              }}
              title="Click to rename project"
              className="bg-transparent hover:bg-[#1a2436] focus:bg-[#0f172a] text-slate-200 text-sm font-medium px-2 py-1 rounded border border-transparent focus:border-blue-500 focus:outline-none max-w-[220px] truncate transition"
            />
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                isSaved
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20'
                  : 'text-amber-400 bg-amber-950/40 border border-amber-500/20'
              }`}
            >
              {isSaved ? 'Saved' : 'Unsaved'}
            </span>
            {saveStatusMsg && (
              <span className="text-xs text-blue-400 font-medium animate-in fade-in">
                {saveStatusMsg}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Action Tools & Run Button */}
        <div className="flex items-center gap-2">
          {/* Mobile view toggle (Editor vs Preview/Terminal) */}
          <div className="flex md:hidden bg-[#1e293b] p-0.5 rounded-lg border border-[#334155] mr-1">
            <button
              onClick={() => setMobileActiveView('editor')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                mobileActiveView === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileActiveView('output')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                mobileActiveView === 'output'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'web' ? 'Preview' : 'Output'}
            </button>
          </div>

          {/* Settings button */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Editor Settings"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
            >
              <SettingsIcon size={18} />
            </button>

            {/* Settings Popover */}
            {isSettingsOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSettingsOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-[#141e30] border border-[#243550] rounded-xl shadow-2xl p-4 z-40 text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-[#243550] mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Editor Preferences
                    </span>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 text-slate-300">
                        <span>Font Size</span>
                        <span className="font-semibold text-blue-400">
                          {editorSettings.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="22"
                        value={editorSettings.fontSize}
                        onChange={(e) =>
                          setEditorSettings((prev) => ({
                            ...prev,
                            fontSize: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Word Wrap</span>
                      <button
                        onClick={() =>
                          setEditorSettings((prev) => ({
                            ...prev,
                            wordWrap: prev.wordWrap === 'on' ? 'off' : 'on',
                          }))
                        }
                        className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                          editorSettings.wordWrap === 'on'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#223249] text-slate-400'
                        }`}
                      >
                        {editorSettings.wordWrap.toUpperCase()}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Minimap</span>
                      <button
                        onClick={() =>
                          setEditorSettings((prev) => ({
                            ...prev,
                            minimap: !prev.minimap,
                          }))
                        }
                        className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                          editorSettings.minimap
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#223249] text-slate-400'
                        }`}
                      >
                        {editorSettings.minimap ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Tab Indent</span>
                      <div className="flex gap-1">
                        {[2, 4].map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              setEditorSettings((prev) => ({ ...prev, tabSize: size }))
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              editorSettings.tabSize === size
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#223249] text-slate-400'
                            }`}
                          >
                            {size} spaces
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Saved Projects modal trigger */}
          <button
            onClick={() => setIsProjectsModalOpen(true)}
            title="Open Saved Projects"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            <FolderOpen size={18} />
          </button>

          {/* Save Project button */}
          <button
            onClick={handleSaveProject}
            title="Save Project (Ctrl+S)"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            <Save size={18} />
          </button>

          {/* Reset Code button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            title="Reset to Starter Template"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            <RotateCcw size={18} />
          </button>

          {/* Fullscreen workspace toggle */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
            className="hidden sm:block p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Prominent Run Code button (Matching reference screenshot styling) */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-75 text-white rounded-full text-sm font-semibold transition shadow-lg shadow-blue-600/30 active:scale-95 ml-1"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play size={16} className="fill-white" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Body: Monaco Editor (Left) & Output/Preview Panel (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Monaco Code Editor */}
        <div
          style={{ width: `${editorWidthPercent}%` }}
          className={`h-full flex flex-col min-w-[280px] bg-[#0d121f] ${
            mobileActiveView === 'output' ? 'hidden md:flex' : 'flex'
          } ${mobileActiveView === 'editor' ? 'w-full md:w-auto' : ''}`}
        >
          <MonacoCodeEditor
            code={currentCode}
            language={
              mode === 'web'
                ? activeWebTab === 'html'
                  ? 'html'
                  : activeWebTab === 'css'
                  ? 'css'
                  : 'javascript'
                : currentLangMeta.monacoLang
            }
            fileName={currentFileName}
            fileIcon={currentFileIcon}
            settings={editorSettings}
            onChange={handleEditorCodeChange}
            onRun={handleRunCode}
            onSave={handleSaveProject}
            onReset={() => setResetConfirmOpen(true)}
            tabs={
              mode === 'web'
                ? [
                    { id: 'html', label: 'HTML', icon: 'html', badgeColor: '#e44d26' },
                    { id: 'css', label: 'CSS', icon: 'css', badgeColor: '#264de4' },
                    { id: 'js', label: 'JAVASCRIPT', icon: 'js', badgeColor: '#f7df1e' },
                  ]
                : undefined
            }
            activeTabId={mode === 'web' ? activeWebTab : undefined}
            onTabChange={(id) => setActiveWebTab(id as 'html' | 'css' | 'js')}
          />
        </div>

        {/* Resizable Divider Handle (Desktop) */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            isResizingRef.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
          className="hidden md:flex w-1 bg-[#1a2436] hover:bg-blue-500 cursor-col-resize transition-colors items-center justify-center shrink-0 group relative z-10"
        >
          <div className="w-0.5 h-8 bg-slate-600 rounded-full group-hover:bg-blue-300 transition" />
        </div>

        {/* Right Side: Output / Preview Panel */}
        <div
          style={{ width: `${100 - editorWidthPercent}%` }}
          className={`h-full flex flex-col min-w-[280px] bg-[#0c121e] overflow-hidden ${
            mobileActiveView === 'editor' ? 'hidden md:flex' : 'flex'
          } ${mobileActiveView === 'output' ? 'w-full md:w-auto' : ''}`}
        >
          {mode === 'web' ? (
            <WebPreviewPanel
              htmlCode={webFiles.html || ''}
              cssCode={webFiles.css || ''}
              jsCode={webFiles.js || ''}
            />
          ) : (
            <TerminalOutputPanel
              result={executionResult}
              isRunning={isRunning}
              stdin={stdin}
              onStdinChange={setStdin}
              onClear={() => setExecutionResult(null)}
            />
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#131d31] border border-[#223554] rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Reset Code to Starter Template?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              This action will discard any unsaved modifications in your current active files and restore the initial default starter template for {currentLangMeta.name}.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#1c2b44] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCode}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow-md shadow-red-600/20"
              >
                Reset Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Projects Modal */}
      <ProjectManagerModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        uid={uid}
        currentProjectId={currentProject?.id}
        onSelectProject={handleSelectProject}
        onCreateNewProject={handleCreateNewProject}
      />
    </div>
  );
};
export default PlaygroundPage;
