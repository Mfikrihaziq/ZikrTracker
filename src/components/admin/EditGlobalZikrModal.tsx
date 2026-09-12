import React, { useState, useEffect } from 'react';
import { ZikrItem, TapSoundType } from '../../types';
import { soundManager, recitationPlayer, TAP_SOUND_OPTIONS } from '../../utils/audio';
import { X, Sparkles, AlertCircle, Save, Layers, Volume2, Square, Music } from 'lucide-react';

interface EditGlobalZikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ZikrItem, 'id' | 'isCustom'> & { id?: string }) => Promise<void>;
  initialData?: ZikrItem | null;
}

export const EditGlobalZikrModal: React.FC<EditGlobalZikrModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [transliteration, setTransliteration] = useState('');
  const [arabic, setArabic] = useState('');
  const [translation, setTranslation] = useState('');
  const [meaningNote, setMeaningNote] = useState('');
  const [defaultTarget, setDefaultTarget] = useState<number>(33);
  const [category, setCategory] = useState<'daily' | 'tasbih' | 'forgiveness'>('daily');
  const [tapSound, setTapSound] = useState<TapSoundType>('wood');
  const [audioUrl, setAudioUrl] = useState('');
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTransliteration(initialData.transliteration || '');
      setArabic(initialData.arabic || '');
      setTranslation(initialData.translation || '');
      setMeaningNote(initialData.meaningNote || '');
      setDefaultTarget(initialData.defaultTarget || 33);
      setCategory((initialData.category as any) || 'daily');
      setTapSound(initialData.tapSound || 'wood');
      setAudioUrl(initialData.audioUrl || '');
    } else {
      setTransliteration('');
      setArabic('');
      setTranslation('');
      setMeaningNote('');
      setDefaultTarget(33);
      setCategory('daily');
      setTapSound('wood');
      setAudioUrl('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTestAudio = () => {
    if (isTestingAudio) {
      recitationPlayer.stop();
      setIsTestingAudio(false);
      return;
    }

    setIsTestingAudio(true);
    recitationPlayer.play(
      {
        id: 'admin-preview',
        arabic: arabic.trim() || 'سُبْحَانَ اللَّهِ',
        transliteration: transliteration.trim() || 'SubhanAllah',
        audioUrl: audioUrl.trim() || undefined,
      },
      () => setIsTestingAudio(false)
    );
  };

  const handleSelectSound = (soundId: TapSoundType) => {
    setTapSound(soundId);
    soundManager.playTapSound(soundId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transliteration.trim()) {
      setError('Transliteration / Title is required.');
      return;
    }
    if (!arabic.trim()) {
      setError('Arabic script is required.');
      return;
    }
    if (defaultTarget <= 0) {
      setError('Default target count must be at least 1.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        id: initialData?.id,
        transliteration: transliteration.trim(),
        arabic: arabic.trim(),
        translation: translation.trim(),
        meaningNote: meaningNote.trim(),
        defaultTarget: Number(defaultTarget),
        category,
        tapSound,
        audioUrl: audioUrl.trim() || undefined,
        order: initialData?.order,
      });
      recitationPlayer.stop();
      onClose();
    } catch (err: any) {
      console.error('Failed to save global zikr:', err);
      setError('Failed to save phrase to Firestore. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#FAF9F6] dark:bg-[#121820] border border-stone-200 dark:border-emerald-500/20 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-emerald-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'Edit Global Preset Zikr' : 'Add New Global Preset Zikr'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This phrase will be available publicly to all users
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              recitationPlayer.stop();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Transliteration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Transliteration <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder="e.g. SubhanAllah"
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Arabic Script */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Arabic Script <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="سُبْحَانَ اللَّهِ"
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xl font-['Amiri'] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* English Translation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              English Meaning / Translation
            </label>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="e.g. Glory be to Allah"
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Virtue / Meaning Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Virtue / Context Note
            </label>
            <textarea
              value={meaningNote}
              onChange={(e) => setMeaningNote(e.target.value)}
              rows={2}
              placeholder="e.g. Affirming Allah is free from any imperfection or flaw."
              className="w-full px-4 py-2 rounded-2xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Bead Tap Sound Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Bead Tap Sound
              </span>
              <span className="text-[10px] text-slate-400">Click to preview</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {TAP_SOUND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectSound(opt.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                    tapSound === opt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                      : 'bg-white dark:bg-[#1A232E] border-stone-200/80 dark:border-emerald-500/20 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-[11px] leading-tight">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recitation Audio Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Recitation Audio MP3 Link (Optional)
              </span>
              {(audioUrl.trim() || arabic.trim()) && (
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isTestingAudio ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Test Audio</span>
                    </>
                  )}
                </button>
              )}
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/recitation.mp3"
              className="w-full px-4 py-2 rounded-2xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If left blank, native Arabic speech synthesis will pronounce the Arabic text.
            </p>
          </div>

          {/* Category & Default Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily">Daily Dhikr</option>
                <option value="tasbih">Tasbih & Praise</option>
                <option value="forgiveness">Istighfar & Forgiveness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Target Count
              </label>
              <div className="flex items-center gap-2">
                {[33, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDefaultTarget(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      defaultTarget === num
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-stone-300 dark:border-slate-700 hover:bg-stone-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={defaultTarget}
                  onChange={(e) => setDefaultTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-[#1A232E] text-slate-900 dark:text-slate-100 text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-[#161E28] border border-stone-200 dark:border-emerald-500/20">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Live Card Preview
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {transliteration || 'Title'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {translation || 'Meaning'}
                </p>
              </div>
              <p className="text-xl font-['Amiri'] text-emerald-700 dark:text-emerald-400">
                {arabic || 'العربية'}
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                recitationPlayer.stop();
                onClose();
              }}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : initialData ? 'Update Phrase' : 'Save to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
