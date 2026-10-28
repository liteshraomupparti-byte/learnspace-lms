import React, { useState } from 'react';
import {
  Terminal,
  Clock,
  Cpu,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { ExecutionResult } from '@/types/playground';

interface TerminalOutputPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  stdin: string;
  onStdinChange: (val: string) => void;
  onClear: () => void;
}

export const TerminalOutputPanel: React.FC<TerminalOutputPanelProps> = ({
  result,
  isRunning,
  stdin,
  onStdinChange,
  onClear,
}) => {
  const [stdinOpen, setStdinOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyOutput = () => {
    const text = result ? `${result.stdout || ''}\n${result.stderr || ''}\n${result.compile_output || ''}`.trim() : '';
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getStatusBadge = () => {
    if (!result) return null;
    const isSuccess = result.status.id === 3;
    const isCompileErr = result.status.id === 6;
    const isTimeout = result.status.id === 5;

    if (isSuccess) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1f6feb]/20 text-[#58a6ff] border border-[#388bfd]/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{result.status.description}</span>
        </span>
      );
    }

    if (isCompileErr) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f85149]/20 text-[#ff7b72] border border-[#f85149]/30">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Compilation Error</span>
        </span>
      );
    }

    if (isTimeout) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d29922]/20 text-[#e3b341] border border-[#d29922]/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Time Limit Exceeded</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f85149]/20 text-[#ff7b72] border border-[#f85149]/30">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{result.status.description || 'Execution Error'}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#c9d1d9] border-l border-[#21262d] overflow-hidden select-none font-mono text-xs">
      {/* Terminal Top Bar */}
      <div className="h-9 bg-[#161b22] border-b border-[#21262d] px-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2">
          {/* Stdin Toggle Button */}
          <button
            onClick={() => setStdinOpen((prev) => !prev)}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors border ${
              stdinOpen
                ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#388bfd]/40'
                : 'text-[#8b949e] border-[#30363d] hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <span>Stdin (Input)</span>
            {stdinOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyOutput}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            title="Copy Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            className="p-1 rounded text-[#8b949e] hover:text-red-400 hover:bg-[#21262d] transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Stdin Input Drawer */}
      {stdinOpen && (
        <div className="p-3 bg-[#161b22] border-b border-[#30363d] space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
            <span>Standard Input (provided to your program via input() or scanf):</span>
            <span className="text-[10px] text-[#6e7681]">{stdin.length} chars</span>
          </div>
          <textarea
            rows={2}
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Type standard input values here, separated by newlines..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#58a6ff] resize-none"
          />
        </div>
      )}

      {/* Execution Metrics Bar */}
      {result && (
        <div className="h-7 bg-[#0b0e14] border-b border-[#21262d] px-3 flex items-center justify-between text-[11px] text-[#8b949e] shrink-0">
          <div className="flex items-center gap-4">
            {result.time && (
              <span className="inline-flex items-center gap-1 text-[#8b949e]">
                <Clock className="w-3 h-3 text-[#58a6ff]" />
                <span>Time: {result.time}s</span>
              </span>
            )}
            {result.memory && (
              <span className="inline-flex items-center gap-1 text-[#8b949e]">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span>Memory: {result.memory} KB</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-[#6e7681]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Runner: {result.provider === 'judge0' ? 'Judge0 Isolated Engine' : 'WebAssembly Runtime'}</span>
          </div>
        </div>
      )}

      {/* Terminal Body */}
      <div className="flex-1 overflow-auto p-4 leading-relaxed font-mono select-text bg-[#080b11]">
        {isRunning ? (
          <div className="flex items-center gap-2.5 text-[#58a6ff] py-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-ping"></span>
            <span>Executing program in secure sandbox...</span>
          </div>
        ) : !result ? (
          <div className="text-[#6e7681] italic text-center py-12">
            No program output yet.
            <br />
            Click <strong>&quot;▶ Run Code&quot;</strong> or press{' '}
            <kbd className="bg-[#161b22] px-1 py-0.5 rounded border border-[#30363d] text-slate-300">Ctrl+Enter</kbd> to compile and execute.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Standard Output */}
            {result.stdout && (
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Program Output (stdout):
                </div>
                <div className="text-[#e6edf3] whitespace-pre-wrap break-all bg-[#0d1117] p-3 rounded-lg border border-[#21262d]">
                  {result.stdout}
                </div>
              </div>
            )}

            {/* Compilation Errors */}
            {result.compile_output && (
              <div>
                <div className="text-[10px] uppercase font-bold text-[#f85149] tracking-wider mb-1">
                  Compilation Errors:
                </div>
                <div className="text-[#ff7b72] whitespace-pre-wrap break-all bg-[#3d1316]/60 p-3 rounded-lg border border-[#f85149]/40">
                  {result.compile_output}
                </div>
              </div>
            )}

            {/* Standard Error / Runtime Exception */}
            {result.stderr && (
              <div>
                <div className="text-[10px] uppercase font-bold text-[#f85149] tracking-wider mb-1">
                  Standard Error (stderr):
                </div>
                <div className="text-[#ff7b72] whitespace-pre-wrap break-all bg-[#3d1316]/60 p-3 rounded-lg border border-[#f85149]/40">
                  {result.stderr}
                </div>
              </div>
            )}

            {/* No Output Message */}
            {!result.stdout && !result.stderr && !result.compile_output && (
              <div className="text-[#8b949e] italic p-3 bg-[#0d1117] rounded-lg border border-[#21262d]">
                Program executed successfully with exit code 0 (No stdout produced).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

