import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ZikrItem } from '../types';
import { AddCustomZikrModal } from './AddCustomZikrModal';
import { recitationPlayer, TAP_SOUND_OPTIONS } from '../utils/audio';
import {
  Search,
  Plus,
  Trash2,
  Check,
  Sparkles,
  BookOpen,
  ArrowRight,
  Filter,
  ShieldCheck,
  Volume2,
  Square,
  Music,
} from 'lucide-react';

interface ZikrLibraryViewProps {
  onSelectZikr: (zikr: ZikrItem) => void;
}

export const ZikrLibraryView: React.FC<ZikrLibraryViewProps> = ({ onSelectZikr }) => {
  const { allZikrs, activeZikr, removeCustomZikr, isAdmin, setCurrentTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tasbih' | 'daily' | 'forgiveness' | 'custom'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingZikrId, setPlayingZikrId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = recitationPlayer.subscribe((activeId) => {
      setPlayingZikrId(activeId);
    });
    return () => {
      unsub();
      recitationPlayer.stop();
    };
  }, []);

  const handleToggleRecitation = (e: React.MouseEvent, item: ZikrItem) => {
    e.stopPropagation();
    if (playingZikrId === item.id) {
      recitationPlayer.stop();
    } else {
      recitationPlayer.play(item);
    }
  };

  // Filter zikrs
  const filteredZikrs = allZikrs.filter((item) => {
    // Category match
    if (selectedFilter === 'custom' && !item.isCustom) return false;
    if (selectedFilter !== 'all' && selectedFilter !== 'custom' && item.category !== selectedFilter) {
      return false;
    }

    // Search query match
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.transliteration.toLowerCase().includes(q) ||
      item.translation.toLowerCase().includes(q) ||
      (item.arabic && item.arabic.includes(q)) ||
      (item.meaningNote && item.meaningNote.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this custom phrase?')) {
      try {
        setDeletingId(id);
        await removeCustomZikr(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Zikr Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select authentic phrases or add your personal recitations to count.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isAdmin && (
            <button
              id="library-manage-presets-btn"
              onClick={() => setCurrentTab('admin')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-xs font-semibold transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Manage Global Library</span>
            </button>
          )}

          <button
            id="add-custom-zikr-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Zikr</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 mb-6">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="zikr-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases (e.g., Subhanallah, Astaghfirullah, praise)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200/80 dark:border-emerald-500/20 bg-white/95 dark:bg-[#121820]/95 text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Phrases' },
            { id: 'tasbih', label: 'Tasbih Post-Salah' },
            { id: 'forgiveness', label: 'Forgiveness' },
            { id: 'daily', label: 'Daily Remembrance' },
            { id: 'custom', label: 'Custom Added' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/90 dark:bg-[#121820]/95 text-slate-600 dark:text-slate-400 border border-stone-200/80 dark:border-emerald-500/20 hover:bg-stone-50 dark:hover:bg-[#1A232E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Zikr Cards */}
      {filteredZikrs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/95 dark:bg-[#121820]/95 rounded-3xl border border-stone-200/80 dark:border-emerald-500/20">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#1A232E] text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No phrases found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No Zikr matches "${searchQuery}". Try a different keyword or create a custom entry.`
              : 'No items in this category yet.'}
          </p>
          {selectedFilter === 'custom' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
            >
              Create Your First Custom Zikr
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredZikrs.map((item) => {
            const isActive = activeZikr.id === item.id;
            return (
              <div
                key={item.id}
                id={`zikr-card-${item.id}`}
                onClick={() => onSelectZikr(item)}
                className={`group relative rounded-3xl p-5 border text-left cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-50/70 dark:bg-[#142324] border-emerald-500 shadow-md dark:shadow-[0_0_20px_-3px_rgba(16,185,129,0.25)]'
                    : 'bg-white/95 dark:bg-[#121820]/95 border-stone-200/80 dark:border-emerald-500/20 hover:border-emerald-400/60 dark:hover:border-emerald-500/50 shadow-xs'
                }`}
              >
                {/* Header tags: Active status, Custom badge, Target */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    {item.isCustom ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-[#1A232E] text-slate-600 dark:text-slate-400">
                        Standard
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Goal: {item.defaultTarget}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.isCustom && (
                      <button
                        id={`delete-zikr-${item.id}`}
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete custom phrase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isActive && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                        <Check className="w-3 h-3" />
                        Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Arabic Calligraphy Display */}
                {item.arabic && (
                  <div
                    className="font-arabic text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-200 my-2 leading-relaxed text-right drop-shadow-xs"
                    dir="rtl"
                  >
                    {item.arabic}
                  </div>
                )}

                {/* Title & Transliteration */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {item.transliteration}
                </h3>

                {/* Translation */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                  "{item.translation}"
                </p>

                {/* Virtue or note */}
                {item.meaningNote && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 bg-stone-50 dark:bg-[#1A232E]/70 p-2 rounded-xl border border-stone-200/50 dark:border-emerald-500/10">
                    {item.meaningNote}
                  </p>
                )}

                {/* Footer: Audio Recitation, Sound Style & Selection */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-emerald-500/15 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleToggleRecitation(e, item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        playingZikrId === item.id
                          ? 'bg-emerald-600 text-white animate-pulse shadow-xs'
                          : 'bg-stone-100 dark:bg-[#1A232E] text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300'
                      }`}
                      title={playingZikrId === item.id ? 'Stop audio' : 'Listen to recitation'}
                    >
                      {playingZikrId === item.id ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Audio</span>
                        </>
                      )}
                    </button>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-stone-100 dark:bg-[#1A232E] px-2 py-1 rounded-xl">
                      <Music className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{TAP_SOUND_OPTIONS.find((s) => s.id === (item.tapSound || 'wood'))?.label || 'Wood'}</span>
                    </span>
                  </div>

                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{isActive ? 'Currently Counting' : 'Select'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Zikr Modal */}
      <AddCustomZikrModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={(id) => {
          const found = allZikrs.find((z) => z.id === id);
          if (found) onSelectZikr(found);
        }}
      />
    </div>
  );
};
