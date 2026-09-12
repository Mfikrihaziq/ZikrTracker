import React, { useState } from 'react';
import { useApp, TabType } from '../context/AppContext';
import {
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  Sun,
  Moon,
  Flame,
  LogOut,
  User as UserIcon,
  ChevronDown,
  BookOpen,
  BarChart3,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    user,
    userProfile,
    isAdmin,
    signIn,
    signOut,
    authError,
    clearAuthError,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    isDark,
    toggleTheme,
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signIn();
    } finally {
      setSigningIn(false);
    }
  };

  const isUnauthorizedDomainError = authError?.startsWith('auth/unauthorized-domain:');
  const unauthorizedHostname = isUnauthorizedDomainError ? authError.replace('auth/unauthorized-domain:', '') : '';

  const handleCopyDomain = () => {
    if (!unauthorizedHostname) return;
    navigator.clipboard.writeText(unauthorizedHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  const streak = userProfile?.streak || 0;

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF9F6]/90 dark:bg-[#0B0F14]/90 border-b border-stone-200/80 dark:border-emerald-500/20 transition-colors dark:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.08)] relative">
      {/* Subtle Islamic geometric accent line across header bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/50 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Streak */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentTab('counter')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 dark:from-emerald-500 dark:to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform border border-emerald-400/20">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Zikr Tracker
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Digital Tasbih
              </p>
            </div>
          </button>

          {/* Active Streak Badge */}
          <div
            id="header-streak-badge"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              streak > 0
                ? 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/60 shadow-xs'
                : 'bg-stone-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-stone-200 dark:border-slate-800'
            }`}
            title={`${streak} consecutive days of dhikr`}
          >
            <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Counter, Library, Dashboard) */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 dark:bg-[#121820] p-1 rounded-2xl border border-stone-300/60 dark:border-emerald-500/20 shadow-inner">
          <button
            id="nav-tab-counter"
            onClick={() => setCurrentTab('counter')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'counter'
                ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-stone-200/60 dark:border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Counter
          </button>
          <button
            id="nav-tab-library"
            onClick={() => setCurrentTab('library')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'library'
                ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-stone-200/60 dark:border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Library
          </button>
          <button
            id="nav-tab-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-stone-200/60 dark:border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </button>
          {isAdmin && (
            <button
              id="nav-tab-admin"
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm border border-emerald-500'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* Controls: Audio, Haptic, Theme Toggle Switch, Auth */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                : 'bg-stone-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border-stone-200 dark:border-slate-800'
            }`}
            title={soundEnabled ? 'Sound feedback on' : 'Sound feedback off'}
            aria-label="Toggle sound feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptic Toggle */}
          <button
            id="haptic-toggle-btn"
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              hapticEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                : 'bg-stone-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border-stone-200 dark:border-slate-800'
            }`}
            title={hapticEnabled ? 'Haptic vibration on' : 'Haptic vibration off'}
            aria-label="Toggle haptic vibration"
          >
            {hapticEnabled ? <Vibrate className="w-4 h-4" /> : <VibrateOff className="w-4 h-4" />}
          </button>

          {/* Light/Dark Mode Toggle Switch */}
          <button
            id="theme-toggle-switch"
            role="switch"
            aria-checked={isDark}
            onClick={toggleTheme}
            className="w-14 h-8 rounded-full p-1 transition-all relative flex items-center border border-stone-300/80 dark:border-emerald-500/40 bg-stone-200 dark:bg-[#101720] shadow-inner cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle light and dark mode"
          >
            {/* Background decorative icons */}
            <div className="w-full flex items-center justify-between px-1 pointer-events-none">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Sliding Thumb */}
            <div
              className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out ${
                isDark
                  ? 'translate-x-6 bg-[#1A232E] text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                  : 'translate-x-0 bg-white text-amber-500 border border-stone-200'
              }`}
            >
              {isDark ? (
                <Moon className="w-3 h-3 fill-emerald-400/20" />
              ) : (
                <Sun className="w-3.5 h-3.5 fill-amber-500/20" />
              )}
            </div>
          </button>

          {/* User Auth: Google Sign-in or Profile avatar */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-expanded={profileDropdownOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {profileDropdownOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-56 rounded-3xl bg-[#FAF9F6] dark:bg-[#121820] border border-stone-200 dark:border-emerald-500/20 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)]"
                  >
                    <div className="px-4 py-2 border-b border-stone-200/80 dark:border-emerald-500/15">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {user.displayName || 'Friend'}
                        </p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Cloud Sync Active
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        id="user-profile-admin-btn"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setCurrentTab('admin');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-between transition-colors cursor-pointer border-b border-stone-200/60 dark:border-emerald-500/15"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Admin Panel</span>
                        </div>
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold">
                          Manage
                        </span>
                      </button>
                    )}

                    <button
                      id="user-signout-btn"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="google-signin-btn"
                onClick={handleSignIn}
                disabled={signingIn}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-70"
              >
                {/* Google "G" icon */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Error Banner */}
      {authError && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-t border-amber-300 dark:border-amber-700/60 px-4 py-3 text-xs text-amber-900 dark:text-amber-100 transition-all">
          {isUnauthorizedDomainError ? (
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950 dark:text-amber-200">
                    Domain not authorized in Firebase Console
                  </p>
                  <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                    Google Sign-In blocked this attempt because your domain is not yet on the allowlist for Firebase project <code className="px-1.5 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 rounded font-mono text-[11px]">zikr-tracker-d6467</code>.
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">Domain to add:</span>
                    <span className="font-mono text-[11px] bg-white dark:bg-black/40 px-2 py-1 rounded border border-amber-300 dark:border-amber-700 select-all font-semibold">
                      {unauthorizedHostname || window.location.hostname}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <a
                  href="https://console.firebase.google.com/project/zikr-tracker-d6467/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200 dark:bg-amber-900/80 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-semibold text-xs border border-amber-300 dark:border-amber-700 transition-colors"
                >
                  <span>Open Firebase Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span>{authError}</span>
              <button
                onClick={clearAuthError}
                className="text-xs underline font-semibold ml-2 hover:opacity-80 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
