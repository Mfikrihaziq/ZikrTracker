import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlatformMetrics } from '../../types';
import {
  Users,
  Sparkles,
  TrendingUp,
  Activity,
  RefreshCw,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  const { fetchMetrics, globalZikrs } = useApp();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load metrics:', err);
      setError('Unable to load platform analytics. Please verify permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Gathering platform analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200">
        <p className="font-semibold text-sm mb-2">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxWeeklyRecitations = Math.max(
    ...(metrics?.weeklyUsage.map((w) => w.recitations) || [1]),
    1
  );

  return (
    <div className="space-y-6">
      {/* Top Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Platform Telemetry & Growth
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated metrics across all registered accounts and global recitation records
          </p>
        </div>
        <button
          id="refresh-analytics-btn"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {(metrics?.totalUsers || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>{metrics?.totalAdmins || 0} Admin{metrics?.totalAdmins === 1 ? '' : 's'} with RBAC</span>
          </div>
        </div>

        {/* Total Global Recitations */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Global Recitations
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {(metrics?.totalRecitations || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Avg {metrics?.averageRecitationsPerUser || 0} per seeker</span>
          </div>
        </div>

        {/* Active Today */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Today
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/40">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {(metrics?.activeToday || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Engaged in Dhikr today</span>
          </div>
        </div>

        {/* Active This Week */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              7-Day Active
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/40">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {(metrics?.activeThisWeek || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Weekly engagement base</span>
          </div>
        </div>
      </div>

      {/* 7-Day Usage Activity Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              7-Day Recitation Volume & Active Users
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily volume of dhikr recitations logged across the platform
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Recitations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-400/60 dark:bg-indigo-500/60" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Active Users</span>
            </div>
          </div>
        </div>

        {/* Bar chart visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 border-b border-stone-200 dark:border-slate-800">
          {metrics?.weeklyUsage.map((item, idx) => {
            const heightPercent = Math.max(
              8,
              Math.round((item.recitations / maxWeeklyRecitations) * 100)
            );
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-xl whitespace-nowrap z-20 shadow-lg">
                  {item.recitations.toLocaleString()} counts • {item.activeUsers} users
                </div>

                {/* Bar */}
                <div className="w-full max-w-[48px] flex flex-col justify-end items-center h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-xl bg-linear-to-t from-emerald-600 to-teal-500 dark:from-emerald-600 dark:to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-300 relative shadow-xs"
                  >
                    {item.activeUsers > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {item.activeUsers}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day label */}
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">
                  {item.dayLabel}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {item.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Platform Overview Indicators */}
        <div className="mt-6 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Global Presets in Library: <strong className="text-slate-800 dark:text-slate-200">{globalZikrs.length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Database: <strong className="text-slate-800 dark:text-slate-200">Cloud Firestore (Multi-Region)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Security Model: <strong className="text-slate-800 dark:text-slate-200">RBAC Enforcement Active</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
