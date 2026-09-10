export interface ZikrItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  meaningNote?: string;
  defaultTarget: number;
  isCustom?: boolean;
  category?: 'daily' | 'tasbih' | 'forgiveness' | 'custom';
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  zikrId: string;
  zikrTitle: string;
  arabic: string;
  count: number;
  target: number;
  timestamp: number; // Unix epoch ms
  dateString: string; // YYYY-MM-DD
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  totalCount: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  bestStreak?: number;
  dailyGoal?: number; // Daily Zikr target goal (default 100)
  createdAt?: string;
  updatedAt: string;
}

export interface UserSettings {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  dailyGoal?: number;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  count: number;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalRecitations: number;
  totalAdmins: number;
  activeToday: number;
  activeThisWeek: number;
  averageRecitationsPerUser: number;
  weeklyUsage: {
    dayLabel: string;
    date: string;
    recitations: number;
    activeUsers: number;
  }[];
}

