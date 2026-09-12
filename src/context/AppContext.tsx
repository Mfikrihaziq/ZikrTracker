import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  auth,
  signInWithGoogle as firebaseGoogleSignIn,
  logOut as firebaseLogOut,
  onAuthStateChanged,
  User,
} from '../firebase/config';
import {
  getOrCreateUserProfile,
  getUserCustomZikrs,
  getUserHistory,
  saveSessionProgress,
  saveUserCustomZikr,
  deleteUserCustomZikr,
  updateUserDailyGoal,
  getTodayDateString,
  PREDEFINED_ADMIN_EMAIL,
  getGlobalZikrs,
  createGlobalZikr,
  updateGlobalZikr,
  deleteGlobalZikr,
  reorderGlobalZikrs,
  getAllUsers,
  updateUserRole,
  getPlatformMetrics,
  seedDefaultGlobalZikrsIfEmpty,
} from '../firebase/service';
import { DEFAULT_ZIKRS } from '../data/defaultZikr';
import { HistoryEntry, UserProfile, ZikrItem, PlatformMetrics } from '../types';
import { triggerSubtleDailyGoalConfetti } from '../utils/confetti';
import { soundManager } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

export type TabType = 'counter' | 'library' | 'dashboard' | 'admin';

interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loadingAuth: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;

  // Active Navigation Tab & Route Guard
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  navigateToTab: (tab: TabType) => void;

  // Active Zikr
  activeZikr: ZikrItem;
  setActiveZikr: (zikr: ZikrItem) => void;

  // Global Presets & Custom Library
  globalZikrs: ZikrItem[];
  customZikrs: ZikrItem[];
  allZikrs: ZikrItem[];
  addCustomZikr: (zikr: Omit<ZikrItem, 'id' | 'isCustom'>) => Promise<ZikrItem>;
  removeCustomZikr: (zikrId: string) => Promise<void>;

  // Admin Global Library CRUD
  createGlobalPreset: (zikr: Omit<ZikrItem, 'id' | 'isCustom'> & { id?: string }) => Promise<ZikrItem>;
  updateGlobalPreset: (id: string, updates: Partial<ZikrItem>) => Promise<void>;
  deleteGlobalPreset: (id: string) => Promise<void>;
  reorderGlobalPresets: (orderedIds: string[]) => Promise<void>;
  refreshGlobalPresets: () => Promise<void>;

  // Admin RBAC & Analytics
  fetchUsersList: () => Promise<UserProfile[]>;
  toggleUserRole: (targetUserId: string, newRole: 'admin' | 'user') => Promise<void>;
  fetchMetrics: () => Promise<PlatformMetrics>;

  // History & Progress
  history: HistoryEntry[];
  recordProgress: (count: number, target: number) => Promise<boolean>;
  refreshHistory: () => Promise<void>;

  // Daily Target Goal
  dailyGoal: number;
  setDailyGoal: (goal: number) => Promise<void>;
  todayTotalSaved: number;
  isDailyGoalAchieved: boolean;
  triggerDailyGoalCelebration: () => void;

  // Feedback settings
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (val: boolean) => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Toast notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_CUSTOM_KEY = 'zikr_custom_items';
const LOCAL_STORAGE_HISTORY_KEY = 'zikr_guest_history';
const LOCAL_STORAGE_GUEST_PROFILE_KEY = 'zikr_guest_profile';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab State with URL check for /admin
  const [currentTab, setCurrentTabState] = useState<TabType>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      return 'admin';
    }
    return 'counter';
  });

  const [globalZikrs, setGlobalZikrs] = useState<ZikrItem[]>(DEFAULT_ZIKRS);
  const [activeZikr, setActiveZikr] = useState<ZikrItem>(DEFAULT_ZIKRS[0]);
  const [customZikrs, setCustomZikrs] = useState<ZikrItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('zikr_sound') !== 'false';
  });
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(() => {
    return localStorage.getItem('zikr_haptic') !== 'false';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('zikr_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Daily Goal state
  const [dailyGoal, setDailyGoalState] = useState<number>(() => {
    const saved = localStorage.getItem('zikr_daily_goal');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 100;
  });

  const today = getTodayDateString();

  const todayTotalSaved = useMemo(() => {
    return history
      .filter((h) => h.dateString === today)
      .reduce((sum, item) => sum + (item.count || 0), 0);
  }, [history, today]);

  const isDailyGoalAchieved = dailyGoal > 0 && todayTotalSaved >= dailyGoal;

  // Determine Admin status based on profile role or predefined Google account email
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const isEmailAdmin = Boolean(user.email && user.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase());
    const isRoleAdmin = userProfile?.role === 'admin';
    return isEmailAdmin || isRoleAdmin;
  }, [user, userProfile]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  }, []);

  // Safe tab navigation & route guard
  const navigateToTab = useCallback(
    (targetTab: TabType) => {
      if (targetTab === 'admin') {
        if (!isAdmin) {
          showToast('Access Denied: Administrator privileges required');
          if (window.location.pathname === '/admin') {
            window.history.replaceState({}, '', '/');
          }
          setCurrentTabState('dashboard');
          return;
        }
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
        setCurrentTabState('admin');
      } else {
        if (window.location.pathname === '/admin') {
          window.history.pushState({}, '', '/');
        }
        setCurrentTabState(targetTab);
      }
    },
    [isAdmin, showToast]
  );

  const setCurrentTab = useCallback(
    (tab: TabType) => {
      navigateToTab(tab);
    },
    [navigateToTab]
  );

  // Route protection for /admin upon initial load & auth resolution
  useEffect(() => {
    if (!loadingAuth) {
      if (window.location.pathname === '/admin') {
        if (!isAdmin) {
          window.history.replaceState({}, '', '/');
          setCurrentTabState('dashboard');
          showToast('Access Denied: Administrator privileges required');
        } else {
          setCurrentTabState('admin');
        }
      }
    }
  }, [loadingAuth, isAdmin, showToast]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        if (!isAdmin) {
          window.history.replaceState({}, '', '/');
          setCurrentTabState('dashboard');
          showToast('Access Denied: Administrator privileges required');
        } else {
          setCurrentTabState('admin');
        }
      } else {
        if (currentTab === 'admin') {
          setCurrentTabState('counter');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdmin, currentTab, showToast]);

  // Sync dailyGoal if user profile has one
  useEffect(() => {
    if (userProfile?.dailyGoal && userProfile.dailyGoal > 0) {
      setDailyGoalState(userProfile.dailyGoal);
      localStorage.setItem('zikr_daily_goal', String(userProfile.dailyGoal));
    }
  }, [userProfile?.dailyGoal]);

  const triggerDailyGoalCelebration = useCallback(() => {
    triggerSubtleDailyGoalConfetti();
    if (soundEnabled) {
      soundManager.playDailyGoalCelebrationChime();
    }
    if (hapticEnabled) {
      triggerHaptic('goal');
    }
  }, [soundEnabled, hapticEnabled]);

  const setDailyGoal = async (newGoal: number) => {
    if (newGoal <= 0) return;
    setDailyGoalState(newGoal);
    localStorage.setItem('zikr_daily_goal', String(newGoal));

    if (user) {
      try {
        await updateUserDailyGoal(user.uid, newGoal);
        setUserProfile((prev) => (prev ? { ...prev, dailyGoal: newGoal } : null));
      } catch (err) {
        console.error('Failed to update daily goal:', err);
      }
    } else if (userProfile) {
      const updated = { ...userProfile, dailyGoal: newGoal };
      setUserProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_GUEST_PROFILE_KEY, JSON.stringify(updated));
    }

    showToast(`Daily Zikr target set to ${newGoal} recitations`);

    if (todayTotalSaved >= newGoal) {
      triggerDailyGoalCelebration();
    }
  };

  // Sync theme class with HTML document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('zikr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('zikr_theme', 'light');
    }
  }, [isDark]);

  // Listen for OS/system theme changes if user hasn't chosen an explicit setting yet
  useEffect(() => {
    if (localStorage.getItem('zikr_theme')) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem('zikr_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('zikr_haptic', String(hapticEnabled));
  }, [hapticEnabled]);

  // Load Global Zikrs from Firestore
  const loadGlobalZikrs = useCallback(async () => {
    try {
      const items = await getGlobalZikrs();
      if (items && items.length > 0) {
        setGlobalZikrs(items);
      }
    } catch (err) {
      console.warn('Could not load global presets:', err);
    }
  }, []);

  useEffect(() => {
    loadGlobalZikrs();
  }, [loadGlobalZikrs]);

  // Handle Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingAuth(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await getOrCreateUserProfile(
            firebaseUser.uid,
            firebaseUser.displayName || 'Friend',
            firebaseUser.email || '',
            firebaseUser.photoURL || ''
          );
          setUserProfile(profile);

          // Seed global zikrs if empty (only if admin)
          if (profile.role === 'admin' || (firebaseUser.email && firebaseUser.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase())) {
            seedDefaultGlobalZikrsIfEmpty().then((seeded) => {
              if (seeded && seeded.length > 0) setGlobalZikrs(seeded);
            }).catch(console.error);
          }

          // Load remote custom zikrs & history
          const [remoteZikrs, remoteHistory] = await Promise.all([
            getUserCustomZikrs(firebaseUser.uid),
            getUserHistory(firebaseUser.uid),
          ]);
          setCustomZikrs(remoteZikrs);
          setHistory(remoteHistory);
        } catch (err: any) {
          console.error('Error loading Firestore user data:', err);
        }
      } else {
        // Load local guest data
        loadGuestData();
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const loadGuestData = () => {
    try {
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_KEY);
      if (savedCustom) {
        setCustomZikrs(JSON.parse(savedCustom));
      }

      const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedGuestProfile = localStorage.getItem(LOCAL_STORAGE_GUEST_PROFILE_KEY);
      if (savedGuestProfile) {
        setUserProfile(JSON.parse(savedGuestProfile));
      } else {
        setUserProfile({
          userId: 'guest',
          displayName: 'Guest Seeker',
          email: '',
          totalCount: 0,
          streak: 0,
          lastActiveDate: '',
          bestStreak: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Local storage fallback
    }
  };

  const signIn = async () => {
    setAuthError(null);
    try {
      await firebaseGoogleSignIn();
      showToast('Signed in with Google successfully!');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by the browser. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setAuthError(`auth/unauthorized-domain:${host}`);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'Unable to sign in. Please try again.');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseLogOut();
      setUser(null);
      loadGuestData();
      if (currentTab === 'admin') {
        setCurrentTabState('dashboard');
        window.history.replaceState({}, '', '/');
      }
      showToast('Signed out successfully.');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  // Add custom Zikr
  const addCustomZikr = async (zikrData: Omit<ZikrItem, 'id' | 'isCustom'>): Promise<ZikrItem> => {
    const newId = 'custom-' + Date.now();
    const newZikr: ZikrItem = {
      ...zikrData,
      id: newId,
      isCustom: true,
      category: 'custom',
      createdAt: new Date().toISOString(),
    };

    if (user) {
      await saveUserCustomZikr(user.uid, newZikr);
    } else {
      const updated = [newZikr, ...customZikrs];
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(updated));
    }

    setCustomZikrs((prev) => [newZikr, ...prev]);
    showToast(`Added "${newZikr.transliteration}" to your library`);
    return newZikr;
  };

  // Remove custom Zikr
  const removeCustomZikr = async (zikrId: string) => {
    if (user) {
      await deleteUserCustomZikr(user.uid, zikrId);
    } else {
      const filtered = customZikrs.filter((z) => z.id !== zikrId);
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(filtered));
    }

    setCustomZikrs((prev) => prev.filter((z) => z.id !== zikrId));

    // If currently active was deleted, reset to default
    if (activeZikr.id === zikrId) {
      setActiveZikr(globalZikrs[0] || DEFAULT_ZIKRS[0]);
    }
    showToast('Phrase removed from library');
  };

  // Admin: Global Preset Management
  const createGlobalPreset = async (
    itemData: Omit<ZikrItem, 'id' | 'isCustom'> & { id?: string }
  ): Promise<ZikrItem> => {
    const created = await createGlobalZikr(itemData);
    setGlobalZikrs((prev) => [...prev, created]);
    showToast(`Created global preset "${created.transliteration}"`);
    return created;
  };

  const updateGlobalPreset = async (id: string, updates: Partial<ZikrItem>) => {
    await updateGlobalZikr(id, updates);
    setGlobalZikrs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    // Also update activeZikr if current matches
    if (activeZikr.id === id) {
      setActiveZikr((cur) => ({ ...cur, ...updates }));
    }
    showToast('Global preset updated');
  };

  const deleteGlobalPreset = async (id: string) => {
    await deleteGlobalZikr(id);
    setGlobalZikrs((prev) => prev.filter((item) => item.id !== id));
    if (activeZikr.id === id) {
      setActiveZikr(globalZikrs.find((g) => g.id !== id) || DEFAULT_ZIKRS[0]);
    }
    showToast('Global preset deleted');
  };

  const reorderGlobalPresets = async (orderedIds: string[]) => {
    // Reorder locally first for snappy UI
    const reordered: ZikrItem[] = [];
    orderedIds.forEach((id, index) => {
      const found = globalZikrs.find((z) => z.id === id);
      if (found) {
        reordered.push({ ...found, order: index + 1 });
      }
    });
    setGlobalZikrs(reordered);
    await reorderGlobalZikrs(orderedIds);
    showToast('Library order updated');
  };

  const refreshGlobalPresets = async () => {
    await loadGlobalZikrs();
  };

  // Admin: RBAC User Management & Metrics
  const fetchUsersList = async () => {
    return await getAllUsers();
  };

  const toggleUserRole = async (targetUserId: string, newRole: 'admin' | 'user') => {
    await updateUserRole(targetUserId, newRole);
    // If the updated user is the current user, update local userProfile
    if (user && user.uid === targetUserId) {
      setUserProfile((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    showToast(`User role updated to ${newRole}`);
  };

  const fetchMetrics = async () => {
    return await getPlatformMetrics();
  };

  // Record session progress
  const recordProgress = async (count: number, target: number): Promise<boolean> => {
    if (count <= 0) return false;

    const willCompleteDailyGoal =
      dailyGoal > 0 &&
      todayTotalSaved < dailyGoal &&
      todayTotalSaved + count >= dailyGoal;

    const today = getTodayDateString();
    const newEntryData = {
      userId: user?.uid || 'guest',
      zikrId: activeZikr.id,
      zikrTitle: activeZikr.transliteration,
      arabic: activeZikr.arabic,
      count,
      target,
      timestamp: Date.now(),
      dateString: today,
    };

    if (user) {
      try {
        const { profile, historyItem } = await saveSessionProgress(user.uid, newEntryData);
        setUserProfile(profile);
        setHistory((prev) => [historyItem, ...prev]);

        if (willCompleteDailyGoal) {
          triggerDailyGoalCelebration();
          showToast(`🎉 Daily Target Goal Completed (${todayTotalSaved + count}/${dailyGoal}) — Mashallah!`);
        } else {
          showToast(`Saved ${count} counts for ${activeZikr.transliteration}!`);
        }
        return true;
      } catch (err) {
        console.error('Failed to save to Firestore:', err);
        showToast('Saved locally; sync failed.');
      }
    }

    // Guest fallback
    const guestEntry: HistoryEntry = {
      ...newEntryData,
      id: 'history-' + Date.now(),
    };

    const updatedHistory = [guestEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));

    const curProfile = userProfile || {
      userId: 'guest',
      displayName: 'Guest Seeker',
      email: '',
      totalCount: 0,
      streak: 1,
      lastActiveDate: today,
      bestStreak: 1,
      dailyGoal: dailyGoal || 100,
      updatedAt: new Date().toISOString(),
    };

    const updatedProfile: UserProfile = {
      ...curProfile,
      totalCount: (curProfile.totalCount || 0) + count,
      streak: Math.max(1, curProfile.streak || 1),
      lastActiveDate: today,
      dailyGoal: dailyGoal || 100,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_GUEST_PROFILE_KEY, JSON.stringify(updatedProfile));

    if (willCompleteDailyGoal) {
      triggerDailyGoalCelebration();
      showToast(`🎉 Daily Target Goal Completed (${todayTotalSaved + count}/${dailyGoal}) — Mashallah!`);
    } else {
      showToast(`Saved ${count} counts for ${activeZikr.transliteration}!`);
    }
    return true;
  };

  const refreshHistory = async () => {
    if (user) {
      const h = await getUserHistory(user.uid);
      setHistory(h);
    }
  };

  const allZikrs = useMemo(() => {
    return [...globalZikrs, ...customZikrs];
  }, [globalZikrs, customZikrs]);

  return (
    <AppContext.Provider
      value={{
        user,
        userProfile,
        loadingAuth,
        isAdmin,
        signIn,
        signOut,
        authError,
        clearAuthError,
        currentTab,
        setCurrentTab,
        navigateToTab,
        activeZikr,
        setActiveZikr,
        globalZikrs,
        customZikrs,
        allZikrs,
        addCustomZikr,
        removeCustomZikr,
        createGlobalPreset,
        updateGlobalPreset,
        deleteGlobalPreset,
        reorderGlobalPresets,
        refreshGlobalPresets,
        fetchUsersList,
        toggleUserRole,
        fetchMetrics,
        history,
        recordProgress,
        refreshHistory,
        dailyGoal,
        setDailyGoal,
        todayTotalSaved,
        isDailyGoalAchieved,
        triggerDailyGoalCelebration,
        soundEnabled,
        setSoundEnabled,
        hapticEnabled,
        setHapticEnabled,
        isDark,
        toggleTheme,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

