import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  Award,
  HelpCircle,
  Code,
  Zap,
  RotateCcw,
} from 'lucide-react';
import CodeEditor from '../../../components/CodeEditor';
import TerminalConsole from '../../../components/TerminalConsole';
import { QUESTS } from '../../../data/quests';
import { runPython, runQuestTests } from '../../../lib/pyodide';
import { SupabaseStore } from '../../../lib/supabase';
import { Quest, ValidationResult, Profile, UserProgress } from '../../../types';

interface WorkspaceProps {
  questId?: string;
  onBackToQuests?: () => void;
  onOpenPassModal?: () => void;
}

export const WorkspacePage: React.FC<WorkspaceProps> = ({
  questId = 'quest-1',
  onBackToQuests,
  onOpenPassModal,
}) => {
  const currentQuest: Quest =
    QUESTS.find((q) => q.id === questId) || QUESTS[0];

  const [code, setCode] = useState<string>(() =>
    SupabaseStore.getSavedCode(currentQuest.id, currentQuest.starter_code)
  );
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'brief' | 'hints' | 'schema'>('brief');
  const [profile, setProfile] = useState<Profile>(() => SupabaseStore.getProfile());
  const [progress, setProgress] = useState<Record<string, UserProgress>>(() =>
    SupabaseStore.getProgress()
  );

  // Sync state if questId changes
  useEffect(() => {
    setCode(SupabaseStore.getSavedCode(currentQuest.id, currentQuest.starter_code));
    setStdout('');
    setStderr('');
    setValidationResult(null);
  }, [currentQuest.id]);

  const isCompleted = Boolean(progress[currentQuest.id]?.completed);
  const isLockedPro = currentQuest.is_pro && !profile.has_pro_pass && profile.role === 'student';

  // Fast Run code without grading
  const handleRunCodeOnly = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatusText('Compiling Python WebAssembly in browser...');
    setStderr('');

    try {
      const res = await runPython(code, (status) => setStatusText(status));
      setStdout(res.stdout);
      setStderr(res.stderr);
    } catch (err: unknown) {
      setStderr(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
      setStatusText('');
    }
  };

  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const playVictoryChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumph
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
      });
    } catch {
      // Audio context not allowed until interaction
    }
  };

  // Run & Test validation against challenge criteria
  const handleRunAndValidate = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatusText('Running automated challenge test cases...');
    setStderr('');

    try {
      const result = await runQuestTests(code, currentQuest.test_cases, (status) =>
        setStatusText(status)
      );
      setValidationResult(result);
      setStdout(result.stdout);
      setStderr(result.stderr);

      if (result.allPassed) {
        playVictoryChime();

        // Multi-cannon juicy confetti fireworks
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { x: 0.25, y: 0.6 },
          colors: ['#38BDF8', '#34D399', '#FBBF24', '#818CF8'],
        });
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { x: 0.75, y: 0.6 },
          colors: ['#38BDF8', '#34D399', '#FBBF24', '#818CF8'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#FBBF24', '#34D399', '#38BDF8'],
          });
        }, 200);

        // Record progress & award XP
        const { profile: updatedProfile } = SupabaseStore.recordQuestCompletion(
          currentQuest.id,
          100,
          code
        );
        setProfile(updatedProfile);
        setProgress(SupabaseStore.getProgress());
        setShowVictoryModal(true);
      }
    } catch (err: unknown) {
      setStderr(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
      setStatusText('');
    }
  };

  const handleClearOutput = () => {
    setStdout('');
    setStderr('');
    setValidationResult(null);
  };

  // Find next quest
  const currentIndex = QUESTS.findIndex((q) => q.id === currentQuest.id);
  const nextQuest = QUESTS[currentIndex + 1];

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-[#070b14] text-slate-200 overflow-hidden">
      {/* Workspace Sub-Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToQuests && (
            <button
              type="button"
              onClick={onBackToQuests}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quest Map</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400">Level {currentQuest.level}</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-100">{currentQuest.title}</span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed (+{currentQuest.xp_reward} XP)</span>
              </span>
            )}
            {currentQuest.is_pro && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                PRO PASS
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isLockedPro ? (
            <button
              type="button"
              onClick={onOpenPassModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-sm transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Sovereign Creator Pass</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRunCodeOnly}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Run Code</span>
              </button>

              <button
                type="button"
                onClick={handleRunAndValidate}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 active:scale-95 rounded shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Grading Tests...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Run &amp; Test</span>
                  </>
                )}
              </button>
            </>
          )}

          {nextQuest && isCompleted && (
            <button
              type="button"
              onClick={() => {
                if (onBackToQuests) onBackToQuests();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 rounded border border-emerald-800 transition-colors"
            >
              <span>Next Level</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Pane Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden p-3 gap-3">
        {/* Left Pane: Quest Lore, Objectives, Test Expectations (cols: 4) */}
        <div className="lg:col-span-4 flex flex-col bg-[#0b1120] border border-slate-800 rounded-lg overflow-hidden h-full">
          {/* Pane Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border-b border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'brief'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Mission Briefing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeTab === 'hints'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints ({currentQuest.hints.length})</span>
            </button>
          </div>

          {/* Left Pane Scrollable Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {activeTab === 'brief' && (
              <>
                {/* Lore Box */}
                <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-lg">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Storyline Lore</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">{currentQuest.lore}</p>
                </div>

                {/* Objectives */}
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5 text-sm">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Quest Objectives</span>
                  </h4>
                  <ul className="space-y-2">
                    {currentQuest.objectives.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 p-2 bg-slate-900/60 border border-slate-800/80 rounded"
                      >
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-slate-300 leading-normal">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Test Cases Criteria */}
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2 text-sm">
                    Target Output Criteria
                  </h4>
                  <div className="space-y-2">
                    {currentQuest.test_cases.map((tc, i) => (
                      <div
                        key={tc.id || i}
                        className="p-2.5 bg-slate-950/70 border border-slate-800 rounded font-mono text-[11px]"
                      >
                        <div className="text-slate-400 font-sans font-medium mb-1">
                          {tc.title}
                        </div>
                        {tc.expected_output && (
                          <div className="text-emerald-400 whitespace-pre-wrap bg-slate-900 p-1.5 rounded border border-slate-800">
                            {tc.expected_output}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-sans mt-1">
                          {tc.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* XP Reward & Badge Preview */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      +{currentQuest.xp_reward}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">
                        {currentQuest.badge_title}
                      </div>
                      <div className="text-[10px] text-slate-500">Mastery Achievement</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-sky-400 font-medium">
                    {currentQuest.category}
                  </span>
                </div>
              </>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                <p className="text-slate-400">
                  Stuck on this logic challenge? Reveal guided hints below:
                </p>
                {currentQuest.hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-950/20 border border-amber-900/30 rounded text-slate-300"
                  >
                    <div className="text-amber-400 font-semibold mb-1">Hint #{idx + 1}</div>
                    <div className="leading-relaxed">{hint}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Pane: Monaco Editor (cols: 5) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <CodeEditor
            initialCode={currentQuest.starter_code}
            value={code}
            onChange={(val) => {
              setCode(val);
              SupabaseStore.saveCode(currentQuest.id, val);
            }}
            onRun={handleRunAndValidate}
            isRunning={isRunning}
            height="100%"
            className="h-full"
          />
        </div>

        {/* Right Pane: Live Terminal Console & Test Verification (cols: 4) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <TerminalConsole
            stdout={stdout}
            stderr={stderr}
            isRunning={isRunning}
            statusText={statusText}
            validationResult={validationResult}
            onClear={handleClearOutput}
            className="h-full"
          />
        </div>
      </div>

      {/* Juicy Victory Modal Overlay */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#090d16] border-2 border-amber-400/80 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.3)] p-6 text-center space-y-5 overflow-hidden">
            {/* Top Glow Ring */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 text-3xl font-black animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Level Complete
              </span>
              <h3 className="text-2xl font-black text-slate-100 tracking-tight">
                Challenge Conquered!
              </h3>
              <p className="text-xs text-slate-400">
                All unit test assertions verified in Pyodide WebAssembly.
              </p>
            </div>

            {/* Rewards Strip */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                <span className="text-[11px] text-amber-300 font-semibold uppercase block">Earned XP</span>
                <span className="text-xl font-black text-amber-400 font-mono">+{currentQuest.xp_reward} XP</span>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                <span className="text-[11px] text-orange-300 font-semibold uppercase block">Daily Streak</span>
                <span className="text-xl font-black text-orange-400 font-mono">🔥 {profile.streak_days} Days</span>
              </div>
            </div>

            {/* Badge Unlocked */}
            <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                🏅
              </div>
              <div>
                <div className="text-[11px] text-emerald-400 font-bold uppercase">Badge Unlocked</div>
                <div className="text-sm font-bold text-slate-100">{currentQuest.badge_title}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVictoryModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors"
              >
                Review Solution
              </button>

              {nextQuest ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowVictoryModal(false);
                    if (onBackToQuests) onBackToQuests();
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-lg shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Next Quest</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowVictoryModal(false);
                    if (onBackToQuests) onBackToQuests();
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg transition-all"
                >
                  Return to Quest Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
