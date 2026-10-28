import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Terminal,
  Eye,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import type { ConsoleLogItem } from '@/types/playground';

interface WebPreviewPanelProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  autoRefresh?: boolean;
}

export const WebPreviewPanel: React.FC<WebPreviewPanelProps> = ({
  htmlCode,
  cssCode,
  jsCode,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [viewport, setViewport] = useState<'responsive' | 'tablet' | 'mobile'>('responsive');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogItem[]>([]);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [renderTimeMs, setRenderTimeMs] = useState<number | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for console logs forwarded by sandboxed iframe via postMessage
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Validate origin if needed, or inspect message contract
      if (e.data && e.data.type === 'LEARNSPACE_CONSOLE_LOG') {
        const item: ConsoleLogItem = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          level: e.data.level || 'log',
          text: e.data.text || '',
          timestamp: new Date().toLocaleTimeString(),
        };
        setConsoleLogs((prev) => [...prev.slice(-100), item]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    const start = performance.now();
    setPreviewKey((prev) => prev + 1);
    setRenderTimeMs(Math.round(performance.now() - start));
  };

  const handleClearConsole = () => {
    setConsoleLogs([]);
  };

  // Compile combined document with safe console interceptor
  const combinedSrcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          (function() {
            function forwardLog(level, args) {
              try {
                var message = Array.prototype.slice.call(args).map(function(item) {
                  if (typeof item === 'object') {
                    try { return JSON.stringify(item, null, 2); } catch (e) { return String(item); }
                  }
                  return String(item);
                }).join(' ');

                window.parent.postMessage({
                  type: 'LEARNSPACE_CONSOLE_LOG',
                  level: level,
                  text: message
                }, '*');
              } catch (e) {}
            }

            var origLog = console.log;
            var origWarn = console.warn;
            var origError = console.error;
            var origInfo = console.info;

            console.log = function() { forwardLog('log', arguments); if (origLog) origLog.apply(console, arguments); };
            console.warn = function() { forwardLog('warn', arguments); if (origWarn) origWarn.apply(console, arguments); };
            console.error = function() { forwardLog('error', arguments); if (origError) origError.apply(console, arguments); };
            console.info = function() { forwardLog('info', arguments); if (origInfo) origInfo.apply(console, arguments); };

            window.onerror = function(msg, url, line, col, error) {
              forwardLog('error', ['[Uncaught Error]: ' + msg + (line ? ' (Line ' + line + ')' : '')]);
              return false;
            };

            try {
              ${jsCode}
            } catch (err) {
              forwardLog('error', ['[Script Exception]: ' + (err.message || String(err))]);
            }
          })();
        </script>
      </body>
    </html>
  `;

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  const errorCount = consoleLogs.filter((l) => l.level === 'error').length;
  const warnCount = consoleLogs.filter((l) => l.level === 'warn').length;

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] border-l border-[#21262d] overflow-hidden select-none">
      {/* Top Header Toolbar */}
      <div className="h-9 bg-[#ffffff] border-b border-[#e2e8f0] px-3 flex items-center justify-between gap-2 shrink-0">
        {/* Tabs: Preview vs Console */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#edf4ff] text-[#2463eb]'
                : 'text-[#64748b] hover:text-[#101827] hover:bg-[#f1f5f9]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'console'
                ? 'bg-[#edf4ff] text-[#2463eb]'
                : 'text-[#64748b] hover:text-[#101827] hover:bg-[#f1f5f9]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
            {errorCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {errorCount}
              </span>
            )}
            {errorCount === 0 && warnCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {warnCount}
              </span>
            )}
          </button>
        </div>

        {/* Viewport Sizing & Refresh */}
        <div className="flex items-center gap-1">
          {activeTab === 'preview' && (
            <div className="hidden sm:flex items-center gap-0.5 bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
              <button
                onClick={() => setViewport('responsive')}
                title="Desktop 100%"
                className={`p-1 rounded ${
                  viewport === 'responsive' ? 'bg-white shadow-2xs text-[#2463eb]' : 'text-[#64748b]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                title="Tablet (768px)"
                className={`p-1 rounded ${
                  viewport === 'tablet' ? 'bg-white shadow-2xs text-[#2463eb]' : 'text-[#64748b]'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                title="Mobile (375px)"
                className={`p-1 rounded ${
                  viewport === 'mobile' ? 'bg-white shadow-2xs text-[#2463eb]' : 'text-[#64748b]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#101827] transition-colors"
            title="Refresh Preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Live Iframe Preview or Console Logs */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-[#f1f5f9]">
        {activeTab === 'preview' ? (
          <div className="flex-1 flex justify-center items-stretch w-full h-full overflow-auto p-2">
            <div
              className={`h-full w-full ${getViewportWidthClass()} transition-all duration-200 bg-white shadow-sm border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col`}
            >
              <iframe
                key={previewKey}
                ref={iframeRef}
                title="LearnSpace Isolated Preview"
                srcDoc={combinedSrcDoc}
                sandbox="allow-scripts"
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-[#0d1117] text-[#c9d1d9] font-mono text-xs overflow-hidden">
            {/* Console Toolbar */}
            <div className="h-8 bg-[#161b22] border-b border-[#21262d] px-3 flex items-center justify-between text-[11px] text-[#8b949e]">
              <span>Console Logs ({consoleLogs.length})</span>
              <button
                onClick={handleClearConsole}
                className="flex items-center gap-1 text-[#8b949e] hover:text-red-400 transition-colors"
                title="Clear Console"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Console Log Rows */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 leading-relaxed select-text">
              {consoleLogs.length === 0 ? (
                <div className="text-[#6e7681] italic text-center py-8">
                  Console is empty. Any console.log() or JavaScript errors will appear here.
                </div>
              ) : (
                consoleLogs.map((log) => {
                  const isErr = log.level === 'error';
                  const isWarn = log.level === 'warn';
                  return (
                    <div
                      key={log.id}
                      className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 font-mono ${
                        isErr
                          ? 'bg-[#3d1316]/60 border-[#f85149]/40 text-[#ff7b72]'
                          : isWarn
                          ? 'bg-[#341a00]/60 border-[#d29922]/40 text-[#e3b341]'
                          : 'bg-[#161b22] border-[#21262d] text-[#c9d1d9]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isErr ? (
                          <AlertCircle className="w-3.5 h-3.5 text-[#f85149]" />
                        ) : isWarn ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#d29922]" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-[#58a6ff]" />
                        )}
                      </div>
                      <div className="flex-1 whitespace-pre-wrap break-all">{log.text}</div>
                      <div className="text-[10px] text-[#6e7681] shrink-0">{log.timestamp}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

