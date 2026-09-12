import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ZikrItem } from '../../types';
import { EditGlobalZikrModal } from './EditGlobalZikrModal';
import { recitationPlayer, TAP_SOUND_OPTIONS } from '../../utils/audio';
import {
  BookOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Volume2,
  Square,
  Music,
} from 'lucide-react';

export const AdminLibraryTab: React.FC = () => {
  const {
    globalZikrs,
    createGlobalPreset,
    updateGlobalPreset,
    deleteGlobalPreset,
    reorderGlobalPresets,
    refreshGlobalPresets,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ZikrItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ZikrItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reordering, setReordering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = recitationPlayer.subscribe((activeId) => {
      setPlayingId(activeId);
    });
    return () => {
      unsub();
      recitationPlayer.stop();
    };
  }, []);

  const handleToggleRecitation = (item: ZikrItem) => {
    if (playingId === item.id) {
      recitationPlayer.stop();
    } else {
      recitationPlayer.play(item);
    }
  };

  const filteredZikrs = globalZikrs.filter((z) => {
    const q = searchQuery.toLowerCase();
    return (
      z.transliteration.toLowerCase().includes(q) ||
      z.translation.toLowerCase().includes(q) ||
      z.arabic.includes(q) ||
      (z.category && z.category.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ZikrItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaveItem = async (
    data: Omit<ZikrItem, 'id' | 'isCustom'> & { id?: string }
  ) => {
    if (editingItem) {
      await updateGlobalPreset(editingItem.id, data);
    } else {
      await createGlobalPreset(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem) return;
    try {
      setIsDeleting(true);
      await deleteGlobalPreset(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= globalZikrs.length) return;

    try {
      setReordering(true);
      const newItems = [...globalZikrs];
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;

      const orderedIds = newItems.map((item) => item.id);
      await reorderGlobalPresets(orderedIds);
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Global Zikr Library Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, edit, reorder, and remove public preset recitations seen by all seekers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refreshGlobalPresets()}
            className="p-2.5 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700 transition-colors"
            title="Reload library from Firestore"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="add-global-zikr-btn"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Preset Dhikr</span>
          </button>
        </div>
      </div>

      {/* Filter and Count Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, meaning, or Arabic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl text-xs border border-stone-200 dark:border-slate-800 bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          Showing {filteredZikrs.length} of {globalZikrs.length} preset phrases
        </div>
      </div>

      {/* Zikr Items List */}
      <div className="space-y-3">
        {filteredZikrs.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 p-8">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching preset phrases found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or add a new preset zikr.
            </p>
          </div>
        ) : (
          filteredZikrs.map((item, index) => {
            const originalIndex = globalZikrs.findIndex((g) => g.id === item.id);
            const isFirst = originalIndex === 0;
            const isLast = originalIndex === globalZikrs.length - 1;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 hover:border-emerald-400/40 dark:hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                {/* Left: Reorder controls & Details */}
                <div className="flex items-start sm:items-center gap-3">
                  {/* Reorder Up/Down arrows (enabled when not searching) */}
                  <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                    <button
                      onClick={() => handleMove(originalIndex, 'up')}
                      disabled={isFirst || reordering || Boolean(searchQuery)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400">
                      {originalIndex + 1}
                    </span>
                    <button
                      onClick={() => handleMove(originalIndex, 'down')}
                      disabled={isLast || reordering || Boolean(searchQuery)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Information */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {item.transliteration}
                      </h3>
                      {/* Target pill */}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                        Target: {item.defaultTarget}
                      </span>
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700 capitalize">
                          {item.category}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700 flex items-center gap-1">
                        <Music className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {TAP_SOUND_OPTIONS.find((s) => s.id === (item.tapSound || 'wood'))?.label || 'Wood'}
                        </span>
                      </span>
                      {item.audioUrl && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                          Custom MP3
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.translation}
                    </p>
                    {item.meaningNote && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 italic line-clamp-1">
                        "{item.meaningNote}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Arabic script & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 dark:border-slate-800">
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-['Amiri'] text-emerald-700 dark:text-emerald-400">
                      {item.arabic}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleRecitation(item)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        playingId === item.id
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                      }`}
                      title={playingId === item.id ? 'Stop audio' : 'Listen recitation'}
                    >
                      {playingId === item.id ? (
                        <Square className="w-4 h-4 fill-current" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                      title="Edit preset"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Modal */}
      <EditGlobalZikrModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF9F6] dark:bg-[#121820] border border-stone-200 dark:border-emerald-500/20 shadow-2xl p-6">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Delete Global Preset?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to remove "<strong>{deleteConfirmItem.transliteration}</strong>" from the global library? Users will no longer see this in public presets.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
