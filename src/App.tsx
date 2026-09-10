/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TasbihCounter } from './components/TasbihCounter';
import { ZikrLibraryView } from './components/ZikrLibraryView';
import { DashboardView } from './components/DashboardView';
import { AdminPanelView } from './components/AdminPanelView';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';

function MainApp() {
  const { currentTab, setCurrentTab, setActiveZikr } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-200">
      {/* Top Navigation Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'counter' && (
          <TasbihCounter onOpenLibrary={() => setCurrentTab('library')} />
        )}

        {currentTab === 'library' && (
          <ZikrLibraryView
            onSelectZikr={(zikr) => {
              setActiveZikr(zikr);
              setCurrentTab('counter');
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView onStartCounting={() => setCurrentTab('counter')} />
        )}

        {currentTab === 'admin' && (
          <AdminPanelView onBackToCounter={() => setCurrentTab('counter')} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Toast Notification */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
