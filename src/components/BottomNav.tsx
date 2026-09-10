import React from 'react';
import { Sparkles, BookOpen, BarChart3, ShieldCheck } from 'lucide-react';
import { TabType, useApp } from '../context/AppContext';

interface BottomNavProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { isAdmin } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 dark:bg-[#121820]/95 backdrop-blur-md border-t border-stone-200/80 dark:border-emerald-500/20 px-4 py-2 shadow-lg dark:shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.4)]">
      {/* Subtle emerald top border accent */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          id="mobile-nav-counter"
          onClick={() => setCurrentTab('counter')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'counter'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              currentTab === 'counter'
                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Counter</span>
        </button>

        <button
          id="mobile-nav-library"
          onClick={() => setCurrentTab('library')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'library'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              currentTab === 'library'
                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Library</span>
        </button>

        <button
          id="mobile-nav-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              currentTab === 'dashboard'
                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Dashboard</span>
        </button>

        {isAdmin && (
          <button
            id="mobile-nav-admin"
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                currentTab === 'admin'
                  ? 'bg-indigo-100/70 dark:bg-indigo-950/60 shadow-xs'
                  : 'bg-transparent'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px]">Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
