import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../firebase/service';
import { DailyGoalModal } from './DailyGoalModal';
import {
  Flame,
  Calendar,
  Award,
  Clock,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Cloud,
  Layers,
  Sparkles,
  ArrowRight,
  Target,
  PartyPopper,
} from 'lucide-react';

interface DashboardViewProps {
  onStartCounting: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartCounting }) => {
  const {
    user,
    userProfile,
    history,
    signIn,
    dailyGoal,
    setDailyGoal,
    todayTotalSaved,
    isDailyGoalAchieved,
    triggerDailyGoalCelebration,
    soundEnabled,
    showToast,
  } = useApp();

  const [dailyGoalModalOpen, setDailyGoalModalOpen] = useState(false);

  const today = getTodayDateString();

  // Calculate statistics from history & userProfile
  const stats = useMemo(() => {
    // 1. Today's count
    const todayEntries = history.filter((h) => h.dateString === today);
    const todayCount = todayEntries.reduce((acc, curr) => acc + (curr.count || 0), 0);

    // 2. Past 7 days calculation
    const past7DaysData: { date: string; dayLabel: string; count: number; isToday: boolean }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

      const dayTotal = history
        .filter((h) => h.dateString === dateStr)
        .reduce((sum, item) => sum + (item.count || 0), 0);

      past7DaysData.push({
        date: dateStr,
        dayLabel,
        count: dayTotal,
        isToday: dateStr === today,
      });
    }

    const past7DaysTotal = past7DaysData.reduce((acc, curr) => acc + curr.count, 0);

    // Lifetime total: prefer profile total, or compute from history
    const totalLifetime = Math.max(
      userProfile?.totalCount || 0,
      history.reduce((acc, curr) => acc + (curr.count || 0), 0)
    );

    const maxDayCount = Math.max(...past7DaysData.map((d) => d.count), 10);

    return {
      todayCount,
      past7DaysTotal,
      totalLifetime,
      streak: userProfile?.streak || (todayCount > 0 ? 1 : 0),
      bestStreak: Math.max(userProfile?.bestStreak || 0, userProfile?.streak || 0),
      past7DaysData,
      maxDayCount,
    };
  }, [history, userProfile, today]);

  // Format date nicely
  const formatHistoryDate = (timestamp: number) => {
    if (!timestamp) return 'Earlier';
    const date = new Date(timestamp);
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Zikr Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your daily remembrance progress, active streaks, and session records.
          </p>
        </div>

        <button
          onClick={onStartCounting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/25 transition-all self-start sm:self-auto"
        >
          <span>Open Tasbih</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cloud Sync Status Banner */}
      {!user && (
        <div className="mb-6 p-4 rounded-3xl bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Sync across devices with Google Sign-In
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You are currently in guest mode. Sign in to permanently secure your streak and history in Cloud Firestore.
              </p>
            </div>
          </div>
          <button
            onClick={signIn}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start sm:self-auto shrink-0 shadow-xs"
          >
            Sign In with Google
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Card 1: Today's Total */}
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#121820]/95 border border-stone-200/80 dark:border-emerald-500/20 shadow-xs transition-all hover:border-emerald-400/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.todayCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Recitations today
          </p>
        </div>

        {/* Card 2: Active Streak */}
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#121820]/95 border border-stone-200/80 dark:border-emerald-500/20 shadow-xs transition-all hover:border-amber-400/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Streak</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums flex items-baseline gap-1">
            <span>{stats.streak}</span>
            <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Best: {stats.bestStreak} days
          </p>
        </div>

        {/* Card 3: 7-Day Total */}
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#121820]/95 border border-stone-200/80 dark:border-emerald-500/20 shadow-xs transition-all hover:border-blue-400/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">This Week</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.past7DaysTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Past 7 days
          </p>
        </div>

        {/* Card 4: Lifetime Dhikr */}
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#121820]/95 border border-stone-200/80 dark:border-emerald-500/20 shadow-xs transition-all hover:border-purple-400/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lifetime</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.totalLifetime.toLocaleString()}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Total recorded
          </p>
        </div>
      </div>

      {/* Daily Target Goal Progress Card */}
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#121820]/95 border border-emerald-500/25 dark:border-emerald-500/30 shadow-xs mb-6 relative overflow-hidden bg-islamic-pattern dark:shadow-[0_4px_25px_-5px_rgba(16,185,129,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isDailyGoalAchieved
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isDailyGoalAchieved ? (
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              ) : (
                <Target className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Daily Zikr Target Goal
                </h3>
                {isDailyGoalAchieved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Completed 🎉
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDailyGoalAchieved
                  ? 'Mashallah! You completed your daily remembrance goal today.'
                  : `${Math.max(0, dailyGoal - stats.todayCount)} recitations left to reach today's target.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isDailyGoalAchieved && (
              <button
                id="celebrate-daily-goal-btn"
                onClick={() => {
                  triggerDailyGoalCelebration();
                  showToast('🎉 Daily Target Goal Completed! Mashallah!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Trigger celebratory confetti animation"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Celebrate</span>
              </button>
            )}

            <button
              id="change-daily-goal-btn"
              onClick={() => setDailyGoalModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-white dark:bg-[#1A232E] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              Set Goal ({dailyGoal})
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {stats.todayCount.toLocaleString()} / {dailyGoal.toLocaleString()} recitations
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {dailyGoal > 0 ? Math.min(100, Math.round((stats.todayCount / dailyGoal) * 100)) : 100}%
            </span>
          </div>

          <div className="w-full h-3 bg-stone-100 dark:bg-[#1A232E] rounded-full overflow-hidden p-0.5 border border-stone-200/50 dark:border-emerald-500/15">
            <div
              style={{
                width: `${dailyGoal > 0 ? Math.min(100, Math.round((stats.todayCount / dailyGoal) * 100)) : 100}%`,
              }}
              className={`h-full rounded-full transition-all duration-500 ${
                isDailyGoalAchieved
                  ? 'bg-linear-to-r from-emerald-500 to-amber-400 shadow-sm shadow-emerald-500/30'
                  : 'bg-emerald-600 dark:bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#121820]/95 border border-stone-200/80 dark:border-emerald-500/20 shadow-xs mb-6 bg-islamic-pattern">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Weekly Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total counts logged each day for the past week
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {stats.past7DaysTotal} counts
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
          {stats.past7DaysData.map((d) => {
            const heightPct = Math.max(8, Math.min(100, Math.round((d.count / stats.maxDayCount) * 100)));
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Count tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {d.count}
                </div>

                {/* The Bar */}
                <div className="w-full max-w-[36px] bg-stone-100 dark:bg-[#1A232E] rounded-xl h-full flex items-end p-1 border border-stone-200/40 dark:border-emerald-500/10">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      d.isToday
                        ? 'bg-emerald-600 dark:bg-emerald-400 shadow-sm shadow-emerald-600/30'
                        : d.count > 0
                        ? 'bg-emerald-400/80 dark:bg-emerald-600/70'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`mt-2 text-[11px] font-medium ${
                    d.isToday
                      ? 'font-bold text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log List */}
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#121820]/95 border border-stone-200/80 dark:border-emerald-500/20 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Session History
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {history.length} {history.length === 1 ? 'session' : 'sessions'} logged
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No sessions saved yet. Start counting and tap "Save Progress" to log your Adhkar!
            </p>
            <button
              onClick={onStartCounting}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
            >
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-[#1A232E]">
            {history.slice(0, 15).map((entry) => (
              <div
                key={entry.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {entry.zikrTitle}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {formatHistoryDate(entry.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm tabular-nums">
                    +{entry.count}
                  </span>
                  {entry.target > 0 && (
                    <p className="text-[10px] text-slate-400">
                      Goal: {entry.target}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Target Goal Configuration Modal */}
      <DailyGoalModal
        isOpen={dailyGoalModalOpen}
        currentGoal={dailyGoal}
        onClose={() => setDailyGoalModalOpen(false)}
        onSaveGoal={(newGoal) => setDailyGoal(newGoal)}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
