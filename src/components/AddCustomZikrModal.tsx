import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddCustomZikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (id: string) => void;
}

export const AddCustomZikrModal: React.FC<AddCustomZikrModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const { addCustomZikr } = useApp();

  const [transliteration, setTransliteration] = useState('');
  const [arabic, setArabic] = useState('');
  const [translation, setTranslation] = useState('');
  const [meaningNote, setMeaningNote] = useState('');
  const [defaultTarget, setDefaultTarget] = useState('33');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transliteration.trim()) {
      setError('Please provide a title or transliteration for this Zikr.');
      return;
    }

    const targetNum = parseInt(defaultTarget, 10);
    const validTarget = !isNaN(targetNum) && targetNum > 0 ? targetNum : 33;

    try {
      setSubmitting(true);
      setError('');
      const created = await addCustomZikr({
        transliteration: transliteration.trim(),
        arabic: arabic.trim(),
        translation: translation.trim(),
        meaningNote: meaningNote.trim(),
        defaultTarget: validTarget,
      });

      // Reset form
      setTransliteration('');
      setArabic('');
      setTranslation('');
      setMeaningNote('');
      setDefaultTarget('33');

      onAdded(created.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save custom Zikr.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick insertion helpers for common Arabic characters/phrases
  const quickChars = ['اللَّه', 'سُبْحَانَ', 'الْحَمْدُ', 'أَسْتَغْفِرُ', 'لَا إِلٰهَ إِلَّا', 'صَلِّ'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-white/98 dark:bg-[#121820]/98 rounded-3xl border border-stone-200/90 dark:border-emerald-500/25 shadow-2xl p-6 relative my-8">
        <button
          id="add-custom-zikr-close"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Add Custom Zikr
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Save your personal Du'a, Salawat, or recitation to your cloud library.
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Transliteration <span className="text-rose-500">*</span>
            </label>
            <input
              id="custom-zikr-title-input"
              type="text"
              required
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder="e.g. Rabbi Inni Lima Anzalta Ilayya"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Arabic Text (Optional)
            </label>
            <input
              id="custom-zikr-arabic-input"
              type="text"
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 font-arabic text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {/* Quick Arabic snippet shortcuts */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {quickChars.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setArabic((prev) => (prev ? prev + ' ' + ch : ch))}
                  className="px-2 py-0.5 rounded-md text-[11px] font-arabic bg-stone-100 dark:bg-[#1A232E] text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 border border-stone-200 dark:border-emerald-500/20 cursor-pointer"
                >
                  +{ch}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Translation / Meaning (Optional)
            </label>
            <textarea
              id="custom-zikr-translation-input"
              rows={2}
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="My Lord, truly I am in dire need of whatever good You bestow upon me."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Target Goal
              </label>
              <select
                id="custom-zikr-target-select"
                value={defaultTarget}
                onChange={(e) => setDefaultTarget(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-xs"
              >
                <option value="33">33 Counts</option>
                <option value="100">100 Counts</option>
                <option value="10">10 Counts</option>
                <option value="70">70 Counts</option>
                <option value="500">500 Counts</option>
                <option value="1000">1000 Counts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Virtue / Note (Optional)
              </label>
              <input
                type="text"
                value={meaningNote}
                onChange={(e) => setMeaningNote(e.target.value)}
                placeholder="e.g. Du'a of Musa (AS)"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/25 bg-stone-50 dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-custom-zikr-btn"
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Add to Library'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
