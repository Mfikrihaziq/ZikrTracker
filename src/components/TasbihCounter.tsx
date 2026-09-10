import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { soundManager } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { CustomTargetModal } from './CustomTargetModal';
import { DailyGoalModal } from './DailyGoalModal';
import { ResetConfirmModal } from './ResetConfirmModal';
import { triggerRoundConfetti } from '../utils/confetti';
import {
  RotateCcw,
  Save,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Target,
} from 'lucide-react';

interface TasbihCounterProps {
  onOpenLibrary: () => void;
}

export const TasbihCounter: React.FC<TasbihCounterProps> = ({ onOpenLibrary }) => {
  const {
    activeZikr,
    setActiveZikr,
    allZikrs,
    recordProgress,
    dailyGoal,
    setDailyGoal,
    todayTotalSaved,
    triggerDailyGoalCelebration,
    soundEnabled,
    hapticEnabled,
    showToast,
  } = useApp();

  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(activeZikr.defaultTarget || 33);
  const [isSaving, setIsSaving] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [milestoneCelebrated, setMilestoneCelebrated] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Live calculation of today's total recitations including uncommitted taps
  const currentLiveTotalToday = todayTotalSaved + count;
  const hasReachedDailyGoal = dailyGoal > 0 && currentLiveTotalToday >= dailyGoal;
  const dailyProgressPct = dailyGoal > 0 ? Math.min(100, Math.round((currentLiveTotalToday / dailyGoal) * 100)) : 100;

  // When active zikr changes, sync default target if user hasn't set custom
  useEffect(() => {
    setTarget(activeZikr.defaultTarget || 33);
    setMilestoneCelebrated(false);
  }, [activeZikr.id]);

  // Round / Lap calculation
  const completedRounds = target > 0 ? Math.floor(count / target) : 0;
  const currentRoundProgress = target > 0 ? count % target : count;
  const progressPct = target > 0 ? Math.min(100, Math.round((currentRoundProgress / target) * 100)) : 100;

  // Sound and Haptic Increment
  const handleIncrement = useCallback(() => {
    const nextCount = count + 1;
    const nextLiveTotalToday = todayTotalSaved + nextCount;
    setCount(nextCount);

    if (soundEnabled) {
      soundManager.playTapSound();
    }
    if (hapticEnabled) {
      triggerHaptic('tap');
    }

    // 1. Milestone Check: Completed Daily Zikr Target Goal -> Subtle Confetti Animation!
    if (dailyGoal > 0 && nextLiveTotalToday === dailyGoal) {
      triggerDailyGoalCelebration();
      showToast(`🎉 Daily Zikr Target Goal Completed (${dailyGoal} recitations today) — Mashallah!`);
    } else if (target > 0 && nextCount > 0 && nextCount % target === 0) {
      // 2. Individual phrase round milestone (e.g., 33 or 100 beads)
      if (soundEnabled) {
        soundManager.playGoalChime();
      }
      if (hapticEnabled) {
        triggerHaptic('goal');
      }

      setMilestoneCelebrated(true);
      triggerRoundConfetti();
    }
  }, [
    count,
    target,
    todayTotalSaved,
    dailyGoal,
    soundEnabled,
    hapticEnabled,
    triggerDailyGoalCelebration,
    showToast,
  ]);

  // Tap handler with ripple coordinates
  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const targetEl = e.currentTarget;
    const rect = targetEl.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    } else {
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const rippleId = Date.now() + Math.random();

    setRipples((prev) => [...prev.slice(-3), { id: rippleId, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 550);

    handleIncrement();
  };

  // Keyboard shortcut listener (Space or Enter to count)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsPressed(true);
        const rippleId = Date.now() + Math.random();
        setRipples((prev) => [...prev.slice(-3), { id: rippleId, x: 128, y: 128 }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId));
        }, 550);
        handleIncrement();
        setTimeout(() => setIsPressed(false), 120);
      } else if (e.key === 'r' || e.key === 'R') {
        if (count > 0) setResetModalOpen(true);
      } else if (e.key === 's' || e.key === 'S') {
        if (count > 0) handleSaveProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement, count]);

  // Handle Save
  const handleSaveProgress = async () => {
    if (count <= 0) {
      showToast('Counter is zero. Tap to begin counting first.');
      return;
    }

    try {
      setIsSaving(true);
      const ok = await recordProgress(count, target);
      if (ok) {
        setCount(0);
        setMilestoneCelebrated(false);
        if (soundEnabled) soundManager.playResetSound();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Switch to Next / Previous Zikr
  const currentIndex = allZikrs.findIndex((z) => z.id === activeZikr.id);
  const handlePrevZikr = () => {
    const prevIdx = (currentIndex - 1 + allZikrs.length) % allZikrs.length;
    setActiveZikr(allZikrs[prevIdx]);
  };

  const handleNextZikr = () => {
    const nextIdx = (currentIndex + 1) % allZikrs.length;
    setActiveZikr(allZikrs[nextIdx]);
  };

  // Circular progress SVG calculations
  const radius = 126;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    target > 0 ? circumference - (currentRoundProgress / target) * circumference : 0;

  // Leading edge dot coordinate
  const angle = target > 0 ? (currentRoundProgress / target) * 360 - 90 : -90;
  const rad = (angle * Math.PI) / 180;
  const dotX = 140 + radius * Math.cos(rad);
  const dotY = 140 + radius * Math.sin(rad);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-5rem)] py-3 px-4 pb-20 md:pb-6">
      {/* 1. Active Zikr Phrase Card */}
      <div className="w-full bg-white/95 dark:bg-[#121820]/95 rounded-3xl p-5 border border-stone-200/80 dark:border-emerald-500/20 shadow-sm relative overflow-hidden transition-all bg-islamic-pattern dark:shadow-[0_4px_25px_-5px_rgba(16,185,129,0.1)]">
        {/* Subtle background ornamentation */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Carousel & Library Trigger */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              id="prev-zikr-btn"
              onClick={handlePrevZikr}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous phrase"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {currentIndex + 1} of {allZikrs.length}
            </span>
            <button
              id="next-zikr-btn"
              onClick={handleNextZikr}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next phrase"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            id="open-library-btn"
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer border border-emerald-200/50 dark:border-emerald-800/40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>
        </div>

        {/* Arabic Text Display */}
        <div className="text-center my-2">
          <div
            id="active-zikr-arabic"
            className="font-arabic text-3xl sm:text-4xl font-normal text-emerald-900 dark:text-emerald-200 leading-relaxed tracking-wide select-none py-1 drop-shadow-xs"
            dir="rtl"
          >
            {activeZikr.arabic || 'سُبْحَانَ اللَّهِ'}
          </div>

          {/* Transliteration */}
          <h2
            id="active-zikr-transliteration"
            className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1"
          >
            {activeZikr.transliteration}
          </h2>

          {/* Translation */}
          <p
            id="active-zikr-translation"
            className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 max-w-sm mx-auto italic"
          >
            "{activeZikr.translation}"
          </p>
        </div>

        {/* Target Goal Selector Pills */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-emerald-500/15 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Lap Goal:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[33, 100].map((preset) => (
              <button
                key={preset}
                id={`target-preset-${preset}`}
                onClick={() => setTarget(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  target === preset
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-[#1A232E] text-slate-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}

            <button
              id="custom-goal-btn"
              onClick={() => setGoalModalOpen(true)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                target !== 33 && target !== 100
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-[#1A232E] text-slate-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {target === 0 ? 'Open (∞)' : target !== 33 && target !== 100 ? `${target}` : 'Custom'}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Target Goal Progress Banner & Celebrator */}
      <div className="w-full mt-2.5 px-0.5">
        <div
          id="daily-target-goal-banner"
          onClick={() => {
            if (hasReachedDailyGoal) {
              triggerDailyGoalCelebration();
              showToast('✨ Daily Target Goal Completed! 🎉');
            } else {
              setDailyModalOpen(true);
            }
          }}
          className={`w-full p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
            hasReachedDailyGoal
              ? 'bg-linear-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 border-emerald-500/35 dark:border-emerald-500/40 shadow-xs hover:scale-[1.01]'
              : 'bg-white/90 dark:bg-[#121820]/90 border-stone-200/80 dark:border-emerald-500/20 hover:border-emerald-400/50'
          }`}
          title={hasReachedDailyGoal ? 'Daily goal completed! Tap to celebrate with confetti' : 'Tap to customize daily target goal'}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                hasReachedDailyGoal
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {hasReachedDailyGoal ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              ) : (
                <Target className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {hasReachedDailyGoal ? 'Daily Goal Completed! 🎉' : 'Daily Zikr Goal'}
                </span>
                {hasReachedDailyGoal && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/50 px-1.5 py-0.2 rounded-md">
                    100%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentLiveTotalToday} / {dailyGoal} recitations today
                {hasReachedDailyGoal && ' • Tap to celebrate 🎉'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mini Progress Bar */}
            <div className="w-16 sm:w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${dailyProgressPct}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  hasReachedDailyGoal
                    ? 'bg-linear-to-r from-emerald-500 to-amber-400'
                    : 'bg-emerald-500'
                }`}
              />
            </div>

            <button
              id="edit-daily-goal-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDailyModalOpen(true);
              }}
              className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-1 py-0.5"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* 2. Milestone Badge (when completed current lap target) */}
      {completedRounds > 0 && target > 0 && (
        <div className="my-2 py-1 px-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            Lap {completedRounds} completed ({completedRounds * target} in session)
          </span>
        </div>
      )}

      {/* 3. Large Tap Button with Prominent Circular Progress Ring */}
      <div className="relative my-4 sm:my-6 flex items-center justify-center select-none">
        {/* Floating Goal Progress Badge at top */}
        <div
          id="circular-goal-badge"
          className="absolute -top-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F6] dark:bg-[#151E28] border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-md backdrop-blur-xs"
        >
          <Target className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>
            {target > 0 ? `${currentRoundProgress} / ${target} (${progressPct}%)` : 'Free Count (∞)'}
          </span>
        </div>

        {/* SVG Circular Progress Ring */}
        <svg
          className="w-76 h-76 sm:w-84 sm:h-84 -rotate-90 pointer-events-none drop-shadow-sm"
          viewBox="0 0 280 280"
        >
          <defs>
            <linearGradient id="tasbihGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track background */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            className="stroke-stone-200/80 dark:stroke-[#151F2B] fill-none"
            strokeWidth="10"
          />

          {/* Dynamic Circular Progress Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="url(#tasbihGradient)"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
            filter="url(#emeraldGlow)"
          />

          {/* Leading edge glow dot */}
          {target > 0 && currentRoundProgress > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r="6"
              className="fill-emerald-300 stroke-2 stroke-white dark:stroke-[#101720] drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            />
          )}
        </svg>

        {/* Central Tactile Tap Button with Smooth Scale & Ripple on Press */}
        <button
          id="tasbih-tap-button"
          onClick={handleTap}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className={`absolute w-60 h-60 sm:w-66 sm:h-66 rounded-full flex flex-col items-center justify-center text-center touch-tap select-none focus:outline-none transition-all duration-150 shadow-2xl overflow-hidden cursor-pointer ${
            isPressed
              ? 'scale-95 shadow-inner'
              : 'scale-100 hover:scale-[1.015]'
          } bg-linear-to-b from-white via-[#FAF9F6] to-[#F3F1EC] dark:from-[#151F2A] dark:via-[#0F1620] dark:to-[#090D12] border-2 border-stone-200/90 dark:border-emerald-500/30 shadow-stone-300/40 dark:shadow-[0_0_45px_-8px_rgba(16,185,129,0.25)]`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Tap to count Dhikr"
        >
          {/* Islamic 8-pointed star watermark */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] dark:opacity-[0.08]"
            viewBox="0 0 200 200"
          >
            <polygon
              points="100,15 122,63 174,40 151,92 195,100 151,108 174,160 122,137 100,185 78,137 26,160 49,108 5,100 49,92 26,40 78,63"
              fill="currentColor"
              className="text-emerald-600 dark:text-emerald-400"
            />
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4,4"
              className="text-emerald-600 dark:text-emerald-400"
            />
          </svg>

          {/* Ripple waves expanding on press */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full pointer-events-none animate-tap-ripple bg-emerald-500/20 dark:bg-emerald-400/25"
              style={{
                left: ripple.x - 45,
                top: ripple.y - 45,
                width: 90,
                height: 90,
              }}
            />
          ))}

          {/* Visual Counter */}
          <span
            id="counter-number-display"
            className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums transition-transform duration-100 z-10"
          >
            {count}
          </span>

          {/* Lap Progress Pill */}
          <div className="mt-2 z-10 flex items-center gap-1.5">
            {target > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/60">
                {currentRoundProgress} / {target} ({progressPct}%)
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-400">Open Lap</span>
            )}
          </div>

          {/* Tap Prompt */}
          <div className="mt-2 z-10 text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400/90 font-bold flex items-center gap-1">
            <span>Tap to count</span>
          </div>
        </button>
      </div>

      {/* 4. Action Controls: Reset & Save Progress */}
      <div className="w-full grid grid-cols-2 gap-3 max-w-sm">
        {/* Reset Button */}
        <button
          id="tasbih-reset-btn"
          onClick={() => {
            if (count > 0) {
              setResetModalOpen(true);
            } else {
              showToast('Counter is already at 0');
            }
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-stone-200 dark:border-emerald-500/20 bg-white dark:bg-[#121820] text-slate-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-[#1A232E] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Reset</span>
        </button>

        {/* Save Progress Button */}
        <button
          id="tasbih-save-btn"
          onClick={handleSaveProgress}
          disabled={isSaving || count === 0}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
        </button>
      </div>

      {/* Keyboard reminder tip on desktop */}
      <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center">
        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">Space</kbd> to count, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">S</kbd> to save, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">R</kbd> to reset.
      </p>

      {/* Custom Lap Target Modal */}
      <CustomTargetModal
        isOpen={goalModalOpen}
        currentTarget={target}
        onClose={() => setGoalModalOpen(false)}
        onSelectTarget={(newTarget) => setTarget(newTarget)}
      />

      {/* Daily Target Goal Modal */}
      <DailyGoalModal
        isOpen={dailyModalOpen}
        currentGoal={dailyGoal}
        onClose={() => setDailyModalOpen(false)}
        onSaveGoal={(newGoal) => setDailyGoal(newGoal)}
        soundEnabled={soundEnabled}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={resetModalOpen}
        count={count}
        onClose={() => setResetModalOpen(false)}
        onConfirm={() => {
          setCount(0);
          setMilestoneCelebrated(false);
          setResetModalOpen(false);
          if (soundEnabled) soundManager.playResetSound();
          if (hapticEnabled) triggerHaptic('reset');
          showToast('Counter reset to 0');
        }}
        onSaveAndReset={async () => {
          setResetModalOpen(false);
          await handleSaveProgress();
        }}
      />
    </div>
  );
};

