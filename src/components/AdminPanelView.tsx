import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminAnalyticsTab } from './admin/AdminAnalyticsTab';
import { AdminLibraryTab } from './admin/AdminLibraryTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import {
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Users,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface AdminPanelViewProps {
  onBackToCounter: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onBackToCounter }) => {
  const { user, userProfile, globalZikrs } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'library' | 'users'>('analytics');

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Top Banner with Return to App */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-900/90 via-teal-900/90 to-slate-950 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden mb-6">
        {/* Subtle geometric pattern glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Admin Control Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 shadow-xs">
                  Role: Administrator
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-1">
                Signed in as <strong>{user?.email || userProfile?.displayName || 'Admin'}</strong> • Access Protected via Firestore RBAC Rules
              </p>
            </div>
          </div>

          <button
            id="admin-back-to-counter-btn"
            onClick={onBackToCounter}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-200/70 dark:bg-[#121820] border border-stone-300/70 dark:border-emerald-500/20 mb-6 shadow-inner overflow-x-auto">
        <button
          id="admin-subtab-analytics"
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'analytics'
              ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-stone-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics Dashboard</span>
        </button>

        <button
          id="admin-subtab-library"
          onClick={() => setActiveSubTab('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'library'
              ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-stone-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Global Library ({globalZikrs.length})</span>
        </button>

        <button
          id="admin-subtab-users"
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-stone-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>
      </div>

      {/* Render Sub-Tab Views */}
      <div className="animate-in fade-in duration-200">
        {activeSubTab === 'analytics' && <AdminAnalyticsTab />}
        {activeSubTab === 'library' && <AdminLibraryTab />}
        {activeSubTab === 'users' && <AdminUsersTab />}
      </div>
    </div>
  );
};
