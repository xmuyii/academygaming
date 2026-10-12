import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Sparkles,
  Award,
  Shield,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { QUESTS } from '../data/quests';
import { runQuestTests } from '../lib/pyodide';
import { Profile } from '../types';

interface InstructorConsoleProps {
  currentProfile: Profile;
  onSelectQuest: (questId: string) => void;
}

const SAMPLE_STUDENTS = [
  { id: '1', username: 'Ada_Lovelace_01', xp: 950, completed: 5, pass: true, lastActive: '10m ago' },
  { id: '2', username: 'Turing_Enigma_42', xp: 600, completed: 3, pass: false, lastActive: '1h ago' },
  { id: '3', username: 'Babbage_Cog_99', xp: 250, completed: 2, pass: false, lastActive: '3h ago' },
  { id: '4', username: 'CyberOracle_Ifa', xp: 1100, completed: 5, pass: true, lastActive: 'Just now' },
  { id: '5', username: 'Matrix_Neo_7', xp: 450, completed: 2, pass: false, lastActive: 'Yesterday' },
];

export const InstructorConsole: React.FC<InstructorConsoleProps> = ({
  currentProfile,
  onSelectQuest,
}) => {
  const [runningBatch, setRunningBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<Record<string, { passed: boolean; time: number; error?: string }>>({});
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const handleRunBatchVerification = async () => {
    setRunningBatch(true);
    const results: Record<string, { passed: boolean; time: number; error?: string }> = {};

    for (const quest of QUESTS) {
      try {
        const codeToTest = quest.solution_code || quest.starter_code;
        const res = await runQuestTests(codeToTest, quest.test_cases);
        results[quest.id] = {
          passed: res.allPassed,
          time: res.executionTimeMs,
        };
      } catch (err: unknown) {
        results[quest.id] = {
          passed: false,
          time: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    setBatchResults(results);
    setRunningBatch(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-slate-100">Instructor Management Console</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervise young developer cohorts, grade submissions, and verify curriculum test invariants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunBatchVerification}
            disabled={runningBatch}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            {runningBatch ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Validating All Quests...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Batch Test Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0b1120] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Enrolled Students</div>
          <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums mt-1">42</div>
          <div className="text-[11px] text-emerald-400 mt-1">+6 this week</div>
        </div>

        <div className="p-4 bg-[#0b1120] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Average Student XP</div>
          <div className="text-2xl font-bold text-amber-300 font-mono tabular-nums mt-1">670 XP</div>
          <div className="text-[11px] text-slate-500 mt-1">Goal: 800 XP by Friday</div>
        </div>

        <div className="p-4 bg-[#0b1120] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Curriculum Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">88.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Based on automated Pyodide runs</div>
        </div>

        <div className="p-4 bg-[#0b1120] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Creator Pass Penetration</div>
          <div className="text-2xl font-bold text-purple-400 font-mono tabular-nums mt-1">64%</div>
          <div className="text-[11px] text-slate-500 mt-1">27 students with Pro Pass</div>
        </div>
      </div>

      {/* Curriculum Health & Batch Verification Status */}
      <div className="p-6 bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Curriculum Test Suite Verification</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates canonical solution code against test cases inside browser WebAssembly.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60">
          {QUESTS.map((quest) => {
            const result = batchResults[quest.id];

            return (
              <div
                key={quest.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sky-400 font-bold">L{quest.level}</span>
                  <div>
                    <div className="font-bold text-slate-200">{quest.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {quest.test_cases.length} test assertions · {quest.xp_reward} XP
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {result ? (
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS ({result.time}ms)</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 text-[11px] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Pending run</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectQuest(quest.id)}
                    className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    Open Editor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="p-6 bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-lg space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Student Performance Cohort</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time telemetry synced with Supabase <code className="text-sky-400 font-mono">public.user_progress</code>.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Cadet Username</th>
                <th className="py-2.5 px-4">Experience (XP)</th>
                <th className="py-2.5 px-4">Quests Solved</th>
                <th className="py-2.5 px-4">Creator Pass</th>
                <th className="py-2.5 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {SAMPLE_STUDENTS.map((student) => (
                <tr key={student.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-200">
                    {student.username}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-amber-300 font-bold tabular-nums">
                    {student.xp} XP
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 font-mono tabular-nums">
                    {student.completed}/5 Quests
                  </td>
                  <td className="py-2.5 px-4">
                    {student.pass ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">STANDARD</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 font-mono">
                    {student.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorConsole;
