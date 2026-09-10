import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      id="app-toast"
      className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 max-w-sm pointer-events-none"
    >
      <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span className="truncate">{toastMessage}</span>
    </div>
  );
};
