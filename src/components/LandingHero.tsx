import React, { useState } from 'react';
import { Play, Sparkles, ArrowRight, Shield, Terminal, Cpu, Zap, CheckCircle2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { runPython } from '../lib/pyodide';

const PRESETS = [
  {
    name: 'Binary Divination (Ifá Logic)',
    code: `# Ancient Ifá Binary Computational Matrix
# Each Odu sign is composed of 8 binary bits (1 = light/active, 0 = void/dormant)

odu_ogbe = [1, 1, 1, 1, 1, 1, 1, 1]
odu_oyeku = [0, 0, 0, 0, 0, 0, 0, 0]

print("=== SOVEREIGN LOGIC ORACLE ===")
print(f"Odu Ogbe (Pure Light): {odu_ogbe}")
print(f"Odu Oyeku (Deep Void): {odu_oyeku}")

# Compute binary convergence parity
parity_ogbe = sum(odu_ogbe) % 2
print(f"Ogbe Sacred Parity Check: {parity_ogbe}")
print("Oracle Status: SYNCHRONIZED")
`,
  },
  {
    name: 'Cyber Energy Wave (ASCII)',
    code: `# Cyber Energy Ring Visualizer
import math

print("=== QUANTUM PULSE WAVE ===")
for i in range(12):
    spaces = int(10 + 8 * math.sin(i * 0.5))
    bar = "=" * spaces + ">"
    print(f"[{i:02d}] {bar} ⚡")
`,
  },
  {
    name: 'Recursive Fibonacci Pulse',
    code: `# High-Performance In-Browser Recursive Sequence
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print("Calculating Fibonacci sequence up to 10...")
for i in range(11):
    print(f"fib({i}) = {fib(i)}")
`,
  },
];

interface LandingHeroProps {
  onEnterQuestLine: () => void;
  onOpenPassModal: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterQuestLine,
  onOpenPassModal,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [code, setCode] = useState(PRESETS[0].code);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [hasRunOnce, setHasRunOnce] = useState(false);

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setCode(PRESETS[index].code);
    setStdout('');
    setStderr('');
  };

  const handleRunPublicCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatusText('Running inside browser WebAssembly...');
    setStderr('');

    try {
      const res = await runPython(code, (status) => setStatusText(status));
      setStdout(res.stdout || '(Execution completed with no standard output)');
      setStderr(res.stderr);
      setHasRunOnce(true);
    } catch (err: unknown) {
      setStderr(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
      setStatusText('');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header Section */}
      <section className="relative px-6 pt-10 pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold tracking-wide">
              <span>ZERO-FRICTION BROWSER WEBASSEMBLY ENGINE</span>
              <span aria-hidden="true">·</span>
              <span>PYTHON 3.12 FOR NEXT-GEN CREATORS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight text-balance leading-tight">
              Gamified Python Coding LMS &amp; Real-Time WebAssembly Sandbox
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              Empower young minds to solve algorithmic quests, understand binary logic patterns, and build text RPG engines directly inside the browser. No installation, zero backend execution costs, fully safe client-side execution.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onEnterQuestLine}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold text-sm rounded shadow-lg shadow-sky-500/25 transition-all"
              >
                <span>Launch Quest Line</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenPassModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Sovereign Creator Pass</span>
              </button>
            </div>

            {/* Proof Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div>
                <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">100%</div>
                <div className="text-slate-400">Client-Side WASM</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">0 ms</div>
                <div className="text-slate-400">Server Latency</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">5 Tiers</div>
                <div className="text-slate-400">Gamified Mastery</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <img
                src="/src/assets/images/sovereign_academy_hero_1791795619314.jpg"
                alt="Cybernetic Academy Advanced Coding Laboratory"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-video"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-sky-400">Pyodide Wasm Matrix</span>
                  <span className="mx-2">·</span>
                  <span>Instant sandbox test environment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Sandbox Interactive Module */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="p-6 bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-100">Public Sandbox Mode</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Test any Python snippet instantly in WebAssembly without creating an account.
              </p>
            </div>

            {/* Presets Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 font-medium mr-1">Sample Snippets:</span>
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    selectedPresetIndex === idx
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Split Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[440px]">
            {/* Editor Pane (7 cols) */}
            <div className="lg:col-span-7 h-full flex flex-col">
              <CodeEditor
                initialCode={PRESETS[selectedPresetIndex].code}
                value={code}
                onChange={setCode}
                onRun={handleRunPublicCode}
                isRunning={isRunning}
                height="100%"
                className="h-full"
              />
            </div>

            {/* Output Pane (5 cols) */}
            <div className="lg:col-span-5 h-full flex flex-col bg-[#080d19] border border-slate-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>WebAssembly Stdout Stream</span>
                </div>
                {isRunning && (
                  <span className="text-[11px] text-sky-400 animate-pulse">{statusText}</span>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs select-text">
                {!stdout && !stderr && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                    <Zap className="w-8 h-8 text-slate-600 mb-2" />
                    <p>Click &quot;Run&quot; or press Ctrl+Enter to execute.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      No server roundtrips — runs 100% in your local browser sandbox.
                    </p>
                  </div>
                )}

                {stdout && (
                  <pre className="text-emerald-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {stdout}
                  </pre>
                )}

                {stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap font-mono p-2 bg-rose-950/30 border border-rose-900/50 rounded mt-2">
                    {stderr}
                  </pre>
                )}
              </div>

              {/* Action Banner inside Sandbox */}
              <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Ready to earn badges &amp; level up?
                </span>
                <button
                  type="button"
                  onClick={onEnterQuestLine}
                  className="flex items-center gap-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded transition-colors"
                >
                  <span>Start Guided Quests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingHero;
