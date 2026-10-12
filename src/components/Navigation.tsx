import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Database, GraduationCap, Flame, CloudCheck, WifiOff, RefreshCw, Trophy } from 'lucide-react';
import { Profile, UserRole } from '../types';
import { SupabaseStore, SyncStatus } from '../lib/supabase';

interface NavigationProps {
  currentView: 'sandbox' | 'quests' | 'workspace' | 'instructor';
  onNavigate: (view: 'sandbox' | 'quests' | 'workspace' | 'instructor') => void;
  profile: Profile;
  onOpenPassModal: () => void;
  onOpenSchemaModal: () => void;
  onOpenLeaderboardModal: () => void;
  onRoleChange: (role: UserRole) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  profile,
  onOpenPassModal,
  onOpenSchemaModal,
  onOpenLeaderboardModal,
  onRoleChange,
}) => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(() => SupabaseStore.getSyncStatus());

  React.useEffect(() => {
    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent<SyncStatus>;
      setSyncStatus(customEvent.detail);
    };

    window.addEventListener('sovereign_sync_status_updated', handleSyncStatus);
    return () => window.removeEventListener('sovereign_sync_status_updated', handleSyncStatus);
  }, []);

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#070b14]/95 border-b border-slate-800 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('sandbox')}
          className="text-lg font-bold tracking-tight text-slate-100 hover:text-sky-400 transition-colors whitespace-nowrap text-left flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-sm font-black">
            ⚡
          </span>
          <span>Sovereign Academy</span>
        </button>
      </div>

      {/* Zone 2: 4 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('sandbox')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'sandbox' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          Public Sandbox
        </button>

        <button
          type="button"
          onClick={() => onNavigate('quests')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'quests' || currentView === 'workspace'
              ? 'text-sky-400 font-semibold'
              : ''
          }`}
        >
          Quest Line
        </button>

        <button
          type="button"
          onClick={() => onNavigate('instructor')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'instructor' ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          Instructor View
        </button>

        <button
          type="button"
          onClick={onOpenLeaderboardModal}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 font-medium"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Leaderboards</span>
        </button>

        <button
          type="button"
          onClick={onOpenSchemaModal}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Supabase Schema</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Switcher */}
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onRoleChange('student')}
            className={`px-2 py-1 rounded transition-colors ${
              profile.role === 'student' ? 'bg-slate-800 text-sky-400 font-medium' : 'text-slate-400'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('instructor')}
            className={`px-2 py-1 rounded transition-colors ${
              profile.role === 'instructor' ? 'bg-slate-800 text-sky-400 font-medium' : 'text-slate-400'
            }`}
          >
            Instructor
          </button>
        </div>

        {/* Offline / Cloud Sync Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono px-2 py-1 bg-slate-950/70 border border-slate-800 rounded">
          {syncStatus.syncInProgress ? (
            <>
              <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : !syncStatus.isOnline ? (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300">Offline Saved</span>
            </>
          ) : syncStatus.pendingSyncCount > 0 ? (
            <>
              <RefreshCw className="w-3 h-3 text-sky-400" />
              <span>{syncStatus.pendingSyncCount} queued</span>
            </>
          ) : (
            <>
              <CloudCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400/90">Synced</span>
            </>
          )}
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-amber-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-bold tabular-nums">{profile.xp_points} XP</span>
        </div>

        {/* Sovereign Creator Pass CTA */}
        {profile.has_pro_pass ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/80 rounded whitespace-nowrap">
            <Shield className="w-3.5 h-3.5" />
            <span>Pass Active</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenPassModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-sm transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Creator Pass</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navigation;
