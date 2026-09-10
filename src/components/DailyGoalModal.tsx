import React, { useState } from 'react';
import { X, Check, Target, Sparkles } from 'lucide-react';
import { triggerSubtleDailyGoalConfetti } from '../utils/confetti';
import { soundManager } from '../utils/audio';

interface DailyGoalModalProps {
  isOpen: boolean;
  currentGoal: number;
  onClose: () => void;
  onSaveGoal: (newGoal: number) => void;
  soundEnabled: boolean;
}

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  isOpen,
  currentGoal,
  onClose,
  onSaveGoal,
  soundEnabled,
}) => {
  const [val, setVal] = useState<string>(String(currentGoal || 100));
  const presets = [
    { target: 33, label: '33', note: 'Standard round' },
    { target: 100, label: '100', note: 'Recommended Sunnah' },
    { target: 300, label: '300', note: 'Complete Tasbih' },
    { target: 500, label: '500', note: 'Devotional target' },
    { target: 1000, label: '1,000', note: 'Spiritual milestone' },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onSaveGoal(num);
      onClose();
    }
  };

  const handleTestEffect = () => {
    triggerSubtleDailyGoalConfetti();
    if (soundEnabled) {
      soundManager.playDailyGoalCelebrationChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white/98 dark:bg-[#121820]/98 rounded-3xl border border-stone-200/90 dark:border-emerald-500/25 shadow-2xl p-6 relative">
        <button
          id="daily-goal-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Daily Zikr Target Goal
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Set your personal daily recitation target. When you reach this daily milestone, a subtle celebratory confetti animation will trigger.
        </p>

        {/* Quick Sunnah Presets */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Common Targets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presets.map((p) => {
              const isSelected = parseInt(val, 10) === p.target;
              return (
                <button
                  key={p.target}
                  id={`daily-preset-${p.target}`}
                  type="button"
                  onClick={() => setVal(String(p.target))}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 dark:bg-[#1A232E] text-slate-700 dark:text-slate-300 border-stone-200 dark:border-emerald-500/20 hover:border-emerald-400'
                  }`}
                >
                  <div className="text-sm font-bold">{p.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isSelected ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {p.note}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Daily Goal Count
            </label>
            <input
              id="daily-goal-input"
              type="number"
              min="1"
              max="99999"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Test subtle confetti button */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Preview celebration animation
              </div>
            </div>
            <button
              id="test-confetti-btn"
              type="button"
              onClick={handleTestEffect}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Test Effect 🎉
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-daily-goal-btn"
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
