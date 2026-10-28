import type { ExecutionRequest, ExecutionResult, SupportedLanguage } from '@/types/playground';

// Rate limiting state
let lastExecutionTime = 0;
const MIN_EXECUTION_INTERVAL_MS = 1500; // 1.5 second throttle between runs

// Global singleton for Pyodide instance
let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

// Initialize Pyodide WebAssembly Python runner
async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadingPromise) return pyodideLoadingPromise;

  pyodideLoadingPromise = new Promise((resolve, reject) => {
    // Check if script is already in document
    const existingScript = document.getElementById('pyodide-cdn-script');
    const onLoaded = async () => {
      try {
        // @ts-ignore
        if (typeof window.loadPyodide === 'function') {
          // @ts-ignore
          pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
          });
          resolve(pyodideInstance);
        } else {
          reject(new Error('Pyodide failed to initialize'));
        }
      } catch (err) {
        reject(err);
      }
    };

    if (existingScript) {
      onLoaded();
      return;
    }

    const script = document.createElement('script');
    script.id = 'pyodide-cdn-script';
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.async = true;
    script.onload = onLoaded;
    script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly runtime from CDN.'));
    document.head.appendChild(script);
  });

  return pyodideLoadingPromise;
}

export const codeExecutionService = {
  // Validate request schema before transmission
  validateRequest(code: string, stdin?: string): { valid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { valid: false, error: 'Source code cannot be empty.' };
    }
    if (code.length > 64 * 1024) {
      return { valid: false, error: 'Source code exceeds maximum size limit (64 KB).' };
    }
    if (stdin && stdin.length > 16 * 1024) {
      return { valid: false, error: 'Standard input exceeds maximum size limit (16 KB).' };
    }
    return { valid: true };
  },

  // Check client-side rate limit
  checkRateLimit(): { allowed: boolean; waitSeconds?: number } {
    const now = Date.now();
    const elapsed = now - lastExecutionTime;
    if (elapsed < MIN_EXECUTION_INTERVAL_MS) {
      const waitSeconds = Math.ceil((MIN_EXECUTION_INTERVAL_MS - elapsed) / 1000);
      return { allowed: false, waitSeconds };
    }
    lastExecutionTime = now;
    return { allowed: true };
  },

  // Execute Python locally using Pyodide (WebAssembly Python 3.11)
  async executePythonPyodide(code: string, stdin?: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    try {
      const pyodide = await getPyodide();

      // Setup standard output and standard error capture
      pyodide.runPython(`
import sys
import io

class _OutputBuffer:
    def __init__(self):
        self.buffer = io.StringIO()
    def write(self, s):
        self.buffer.write(s)
    def flush(self):
        pass
    def getvalue(self):
        return self.buffer.getvalue()

sys_stdout_buf = _OutputBuffer()
sys_stderr_buf = _OutputBuffer()

sys.stdout = sys_stdout_buf
sys.stderr = sys_stderr_buf
`);

      // Provide standard input simulation if provided
      if (stdin) {
        pyodide.runPython(`
import sys
import io
sys.stdin = io.StringIO('''${stdin.replace(/'/g, "\\'")}''')
`);
      }

      // Execute student code
      await pyodide.runPythonAsync(code);

      const stdout = pyodide.runPython('sys_stdout_buf.getvalue()');
      const stderr = pyodide.runPython('sys_stderr_buf.getvalue()');
      const duration = ((performance.now() - startTime) / 1000).toFixed(3);

      return {
        stdout: stdout || null,
        stderr: stderr || null,
        compile_output: null,
        time: duration,
        memory: 14200, // Approximate Wasm VM heap
        status: {
          id: 3,
          description: 'Accepted',
        },
        exitCode: 0,
        provider: 'pyodide',
      };
    } catch (err: any) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(3);
      return {
        stdout: null,
        stderr: err.message || String(err),
        compile_output: null,
        time: duration,
        memory: null,
        status: {
          id: 11,
          description: 'Runtime Error',
        },
        exitCode: 1,
        provider: 'pyodide',
      };
    }
  },

  // Execute code through Judge0 API endpoint
  async executeJudge0(request: ExecutionRequest): Promise<ExecutionResult> {
    const apiUrl = import.meta.env.VITE_JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiKey = import.meta.env.VITE_JUDGE0_API_KEY;
    const apiHost = import.meta.env.VITE_JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-RapidAPI-Key'] = apiKey;
      headers['X-RapidAPI-Host'] = apiHost;
    }

    const payload = {
      language_id: request.languageId,
      source_code: request.sourceCode,
      stdin: request.stdin || '',
      cpu_time_limit: 5, // 5s CPU limit
      wall_time_limit: 10,
      memory_limit: 128000, // 128MB
    };

    // 1. Submit code to Judge0
    const submitRes = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      throw new Error(`Judge0 submission failed (${submitRes.status}): ${errText || submitRes.statusText}`);
    }

    const { token } = await submitRes.json();
    if (!token) {
      throw new Error('Judge0 did not return a submission token.');
    }

    // 2. Poll for results with timeout (max 15 attempts, 1s interval)
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      await new Promise((res) => setTimeout(res, 1000));
      attempts++;

      const checkRes = await fetch(
        `${apiUrl}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`,
        { headers }
      );

      if (!checkRes.ok) continue;

      const result = await checkRes.json();

      // status.id: 1 = In Queue, 2 = Processing
      if (result.status && result.status.id > 2) {
        return {
          stdout: result.stdout || null,
          stderr: result.stderr || null,
          compile_output: result.compile_output || null,
          time: result.time || null,
          memory: result.memory || null,
          status: {
            id: result.status.id,
            description: result.status.description || 'Execution Completed',
          },
          exitCode: result.status.id === 3 ? 0 : 1,
          provider: 'judge0',
        };
      }
    }

    throw new Error('Code execution timed out waiting for Judge0 worker.');
  },

  // Main entry point for general code execution
  async runCode(
    language: SupportedLanguage,
    judge0Id: number | undefined,
    code: string,
    stdin?: string
  ): Promise<ExecutionResult> {
    const val = this.validateRequest(code, stdin);
    if (!val.valid) {
      throw new Error(val.error || 'Invalid code execution request.');
    }

    const rate = this.checkRateLimit();
    if (!rate.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${rate.waitSeconds}s before running again.`);
    }

    const hasJudge0Config = Boolean(import.meta.env.VITE_JUDGE0_API_KEY || import.meta.env.VITE_JUDGE0_API_URL);

    // If Judge0 is configured, try Judge0 first
    if (hasJudge0Config && judge0Id) {
      try {
        return await this.executeJudge0({
          languageId: judge0Id,
          sourceCode: code,
          stdin,
        });
      } catch (err: any) {
        console.warn('Judge0 execution attempt notice:', err.message);
        // If Python, fallback to Pyodide
        if (language.startsWith('python')) {
          return await this.executePythonPyodide(code, stdin);
        }
        throw err;
      }
    }

    // If Python and no Judge0 key is configured, use Pyodide WebAssembly Python
    if (language.startsWith('python')) {
      return await this.executePythonPyodide(code, stdin);
    }

    // For Node.js/JavaScript
    if (language === 'javascript') {
      const startTime = performance.now();
      const logs: string[] = [];
      const errLogs: string[] = [];
      const customConsole = {
        log: (...args: any[]) =>
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        info: (...args: any[]) =>
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        warn: (...args: any[]) =>
          logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        error: (...args: any[]) =>
          errLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
      };

      try {
        const fn = new Function('console', code);
        fn(customConsole);
        const duration = ((performance.now() - startTime) / 1000).toFixed(3);
        return {
          stdout: logs.join('\n') || null,
          stderr: errLogs.length > 0 ? errLogs.join('\n') : null,
          compile_output: null,
          time: duration,
          memory: 8400,
          status: { id: 3, description: 'Accepted' },
          exitCode: 0,
          provider: 'local',
        };
      } catch (err: any) {
        const duration = ((performance.now() - startTime) / 1000).toFixed(3);
        return {
          stdout: logs.length > 0 ? logs.join('\n') : null,
          stderr: err.message || String(err),
          compile_output: null,
          time: duration,
          memory: null,
          status: { id: 11, description: 'Runtime Error' },
          exitCode: 1,
          provider: 'local',
        };
      }
    }

    // For C, C++, and Java when Judge0 credentials are not yet added to .env
    throw new Error(
      `Running ${language.toUpperCase()} requires a Judge0 API key in your .env (VITE_JUDGE0_API_KEY). Python and Web development run directly out-of-the-box in the browser!`
    );
  },
};

