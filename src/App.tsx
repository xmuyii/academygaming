import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingHero from './components/LandingHero';
import QuestMap from './components/QuestMap';
import WorkspacePage from './app/workspace/[questId]/page';
import InstructorConsole from './components/InstructorConsole';
import PassModal from './components/PassModal';
import DatabaseSchemaModal from './components/DatabaseSchemaModal';
import LeaderboardModal from './components/LeaderboardModal';
import { SupabaseStore } from './lib/supabase';
import { Profile, UserProgress, UserRole } from './types';
import { QUESTS } from './data/quests';

export default function App() {
  const [currentView, setCurrentView] = useState<'sandbox' | 'quests' | 'workspace' | 'instructor'>('sandbox');
  const [activeQuestId, setActiveQuestId] = useState<string>('quest-1');
  const [profile, setProfile] = useState<Profile>(() => SupabaseStore.getProfile());
  const [progress, setProgress] = useState<Record<string, UserProgress>>(() => SupabaseStore.getProgress());
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);

  // Sync state whenever local store updates
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Profile>;
      setProfile(customEvent.detail);
    };

    const handleProgressUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Record<string, UserProgress>>;
      setProgress(customEvent.detail);
    };

    window.addEventListener('sovereign_profile_updated', handleProfileUpdate);
    window.addEventListener('sovereign_progress_updated', handleProgressUpdate);

    return () => {
      window.removeEventListener('sovereign_profile_updated', handleProfileUpdate);
      window.removeEventListener('sovereign_progress_updated', handleProgressUpdate);
    };
  }, []);

  const handleSelectQuest = (questId: string) => {
    setActiveQuestId(questId);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (role: UserRole) => {
    const updated = SupabaseStore.setRole(role);
    setProfile(updated);
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all progress back to beginning demo state?')) {
      SupabaseStore.resetProgress();
      setProfile(SupabaseStore.getProfile());
      setProgress(SupabaseStore.getProgress());
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Bar Contract Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        profile={profile}
        onOpenPassModal={() => setIsPassModalOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenLeaderboardModal={() => setIsLeaderboardModalOpen(true)}
        onRoleChange={handleRoleChange}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'sandbox' && (
          <LandingHero
            onEnterQuestLine={() => setCurrentView('quests')}
            onOpenPassModal={() => setIsPassModalOpen(true)}
          />
        )}

        {currentView === 'quests' && (
          <QuestMap
            profile={profile}
            progress={progress}
            onSelectQuest={handleSelectQuest}
            onOpenPassModal={() => setIsPassModalOpen(true)}
            onResetProgress={handleResetProgress}
          />
        )}

        {currentView === 'workspace' && (
          <WorkspacePage
            questId={activeQuestId}
            onBackToQuests={() => setCurrentView('quests')}
            onOpenPassModal={() => setIsPassModalOpen(true)}
          />
        )}

        {currentView === 'instructor' && (
          <InstructorConsole
            currentProfile={profile}
            onSelectQuest={handleSelectQuest}
          />
        )}
      </main>

      {/* Sovereign Creator Pass Modal */}
      <PassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        profile={profile}
        onPassUpdated={(updated) => setProfile(updated)}
      />

      {/* Supabase PostgreSQL Schema & Security Studio */}
      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      {/* Multi-Timeframe Classroom Leaderboards Modal (Phase 4) */}
      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        currentProfile={profile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#050810] px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Sovereign Academy</span>
            <span>·</span>
            <span>Interactive WebAssembly &amp; Python 3.12 LMS</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setIsLeaderboardModalOpen(true)}
              className="hover:text-amber-300 text-amber-400/90 font-medium transition-colors"
            >
              Leaderboards (Daily, Weekly, Monthly, All-Time)
            </button>
            <button
              type="button"
              onClick={() => setIsSchemaModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              PostgreSQL Schema (Supabase)
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('sandbox')}
              className="hover:text-slate-300 transition-colors"
            >
              Public Sandbox
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('quests')}
              className="hover:text-slate-300 transition-colors"
            >
              Quests
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
