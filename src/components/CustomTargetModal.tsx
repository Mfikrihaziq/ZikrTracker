import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface CustomTargetModalProps {
  isOpen: boolean;
  currentTarget: number;
  onClose: () => void;
  onSelectTarget: (target: number) => void;
}

export const CustomTargetModal: React.FC<CustomTargetModalProps> = ({
  isOpen,
  currentTarget,
  onClose,
  onSelectTarget,
}) => {
  const [val, setVal] = useState<string>(currentTarget ? String(currentTarget) : '33');
  const presets = [10, 33, 34, 70, 99, 100, 300, 500, 1000];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onSelectTarget(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white/98 dark:bg-[#121820]/98 rounded-3xl border border-stone-200/90 dark:border-emerald-500/25 shadow-2xl p-6 relative">
        <button
          id="custom-target-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Set Target Goal
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Select a common sunnah goal or enter a custom target count.
        </p>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {presets.map((preset) => (
            <button
              key={preset}
              id={`preset-target-${preset}`}
              type="button"
              onClick={() => {
                onSelectTarget(preset);
                onClose();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                currentTarget === preset
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#1A232E] text-slate-700 dark:text-slate-300 border-stone-200 dark:border-emerald-500/20 hover:border-emerald-400'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Count Number
            </label>
            <input
              id="custom-target-input"
              type="number"
              min="1"
              max="99999"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectTarget(0); // 0 = unlimited / open count
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Unlimited (Open)
            </button>
            <button
              id="custom-target-save-btn"
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
