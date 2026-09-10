import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './error';
import { HistoryEntry, UserProfile, ZikrItem, PlatformMetrics } from '../types';
import { DEFAULT_ZIKRS } from '../data/defaultZikr';

export const PREDEFINED_ADMIN_EMAIL = 'mfhzaki@gmail.com';

// Helper to get local YYYY-MM-DD
export const getTodayDateString = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateString(yesterday);
};

export async function getOrCreateUserProfile(
  userId: string,
  displayName = 'User',
  email = '',
  photoURL = ''
): Promise<UserProfile> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    const today = getTodayDateString();
    const isDefaultAdmin = Boolean(email && email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase());

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // Check if streak broke
      let currentStreak = data.streak || 0;
      const lastDate = data.lastActiveDate || '';
      const yesterday = getYesterdayDateString();

      if (lastDate && lastDate !== today && lastDate !== yesterday) {
        currentStreak = 0; // Streak reset if missed a day
      }

      const assignedRole: 'admin' | 'user' = isDefaultAdmin ? 'admin' : (data.role || 'user');

      const updatedProfile: UserProfile = {
        ...data,
        displayName: displayName || data.displayName,
        email: email || data.email,
        photoURL: photoURL || data.photoURL,
        role: assignedRole,
        streak: currentStreak,
        dailyGoal: data.dailyGoal || 100,
        updatedAt: new Date().toISOString(),
      };

      // Sync role back if promoted or predefined admin
      if (data.role !== assignedRole) {
        await setDoc(userRef, { role: assignedRole }, { merge: true });
      }

      return updatedProfile;
    }

    // Create initial profile
    const assignedRole: 'admin' | 'user' = isDefaultAdmin ? 'admin' : 'user';
    const nowIso = new Date().toISOString();
    const newProfile: UserProfile = {
      userId,
      displayName: displayName || 'Seeker of Dhikr',
      email,
      photoURL,
      role: assignedRole,
      totalCount: 0,
      streak: 0,
      lastActiveDate: '',
      bestStreak: 0,
      dailyGoal: 100,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSessionProgress(
  userId: string,
  entry: Omit<HistoryEntry, 'id'>
): Promise<{ profile: UserProfile; historyItem: HistoryEntry }> {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  let currentTotal = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let lastActiveDate = '';
  let role: 'admin' | 'user' = 'user';

  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile;
    currentTotal = userData.totalCount || 0;
    currentStreak = userData.streak || 0;
    bestStreak = userData.bestStreak || 0;
    lastActiveDate = userData.lastActiveDate || '';
    role = userData.role || 'user';
  }

  // Calculate new streak
  if (lastActiveDate === today) {
    // Already active today; keep current streak (min 1)
    currentStreak = Math.max(1, currentStreak);
  } else if (lastActiveDate === yesterday) {
    // Continued from yesterday
    currentStreak += 1;
  } else {
    // Started fresh
    currentStreak = 1;
  }

  bestStreak = Math.max(bestStreak, currentStreak);
  const newTotal = currentTotal + entry.count;

  // 1. Save to History subcollection
  const historyCol = collection(db, 'users', userId, 'history');
  const newHistoryRef = doc(historyCol);
  const historyItem: HistoryEntry = {
    ...entry,
    id: newHistoryRef.id,
  };

  await setDoc(newHistoryRef, historyItem);

  // 2. Update user profile
  const updatedProfile: Partial<UserProfile> = {
    totalCount: newTotal,
    streak: currentStreak,
    bestStreak,
    lastActiveDate: today,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(userRef, updatedProfile, { merge: true });

  const finalProfile: UserProfile = {
    userId,
    displayName: userSnap.data()?.displayName || 'User',
    email: userSnap.data()?.email || '',
    photoURL: userSnap.data()?.photoURL || '',
    role,
    totalCount: newTotal,
    streak: currentStreak,
    bestStreak,
    lastActiveDate: today,
    dailyGoal: userSnap.data()?.dailyGoal || 100,
    updatedAt: updatedProfile.updatedAt!,
  };

  return { profile: finalProfile, historyItem };
}

export async function updateUserDailyGoal(
  userId: string,
  dailyGoal: number
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { dailyGoal, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function getUserHistory(
  userId: string,
  limitCount = 40
): Promise<HistoryEntry[]> {
  const path = `users/${userId}/history`;
  try {
    const historyCol = collection(db, 'users', userId, 'history');
    const q = query(historyCol, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    const history: HistoryEntry[] = [];
    snap.forEach((d) => {
      history.push({ ...d.data(), id: d.id } as HistoryEntry);
    });
    return history;
  } catch (err) {
    console.error('Error fetching history:', err);
    return [];
  }
}

export async function getUserCustomZikrs(userId: string): Promise<ZikrItem[]> {
  try {
    const zikrCol = collection(db, 'users', userId, 'customZikrs');
    const snap = await getDocs(zikrCol);
    const zikrs: ZikrItem[] = [];
    snap.forEach((d) => {
      zikrs.push({ ...d.data(), id: d.id, isCustom: true } as ZikrItem);
    });
    return zikrs;
  } catch (err) {
    console.error('Error fetching custom zikrs:', err);
    return [];
  }
}

export async function saveUserCustomZikr(
  userId: string,
  zikr: ZikrItem
): Promise<void> {
  const zikrRef = doc(db, 'users', userId, 'customZikrs', zikr.id);
  await setDoc(zikrRef, {
    ...zikr,
    isCustom: true,
    createdAt: zikr.createdAt || new Date().toISOString(),
  });
}

export async function deleteUserCustomZikr(
  userId: string,
  zikrId: string
): Promise<void> {
  const zikrRef = doc(db, 'users', userId, 'customZikrs', zikrId);
  await deleteDoc(zikrRef);
}

// ----------------------------------------------------
// RBAC: User Management & Admin Platform Metrics
// ----------------------------------------------------

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      users.push({ ...d.data(), userId: d.id } as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateUserRole(
  targetUserId: string,
  newRole: 'admin' | 'user'
): Promise<void> {
  const path = `users/${targetUserId}`;
  try {
    const userRef = doc(db, 'users', targetUserId);
    await setDoc(
      userRef,
      {
        role: newRole,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const users = await getAllUsers();
  const totalUsers = users.length;
  const totalRecitations = users.reduce((sum, u) => sum + (u.totalCount || 0), 0);
  const totalAdmins = users.filter((u) => u.role === 'admin' || (u.email && u.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase())).length;

  const todayStr = getTodayDateString();

  // Weekly stats calculation for the last 7 days
  const now = new Date();
  const days: { dayLabel: string; date: string; recitations: number; activeUsers: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayLabel = dayNames[d.getDay()];

    // Count how many users were active on this date
    const activeUsersOnDay = users.filter((u) => u.lastActiveDate === dateStr).length;
    // Recitations estimated from active users on day
    const recitationsOnDay = users
      .filter((u) => u.lastActiveDate === dateStr)
      .reduce((sum, u) => sum + Math.max(u.dailyGoal || 100, Math.floor((u.totalCount || 0) / Math.max(1, u.streak || 1))), 0);

    days.push({
      dayLabel,
      date: dateStr,
      recitations: recitationsOnDay,
      activeUsers: activeUsersOnDay,
    });
  }

  const activeToday = users.filter((u) => u.lastActiveDate === todayStr).length;

  // Active this week (within last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = getTodayDateString(oneWeekAgo);
  const activeThisWeek = users.filter((u) => u.lastActiveDate && u.lastActiveDate >= oneWeekAgoStr).length;

  const averageRecitationsPerUser = totalUsers > 0 ? Math.round(totalRecitations / totalUsers) : 0;

  return {
    totalUsers,
    totalRecitations,
    totalAdmins,
    activeToday,
    activeThisWeek,
    averageRecitationsPerUser,
    weeklyUsage: days,
  };
}

// ----------------------------------------------------
// Global Zikr Library Management (Public Presets)
// ----------------------------------------------------

export async function getGlobalZikrs(): Promise<ZikrItem[]> {
  const path = 'globalZikrs';
  try {
    const zikrCol = collection(db, 'globalZikrs');
    const snap = await getDocs(zikrCol);

    // If empty on first initialization, return DEFAULT_ZIKRS with order
    if (snap.empty) {
      return DEFAULT_ZIKRS.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    }

    const items: ZikrItem[] = [];
    snap.forEach((d) => {
      items.push({ ...d.data(), id: d.id, isCustom: false } as ZikrItem);
    });

    // Sort by order ascending
    items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return items;
  } catch (error) {
    console.warn('Could not fetch globalZikrs from Firestore, falling back to defaults:', error);
    return DEFAULT_ZIKRS.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
  }
}

export async function seedDefaultGlobalZikrsIfEmpty(): Promise<ZikrItem[]> {
  try {
    const zikrCol = collection(db, 'globalZikrs');
    const snap = await getDocs(zikrCol);
    if (!snap.empty) {
      const items: ZikrItem[] = [];
      snap.forEach((d) => {
        items.push({ ...d.data(), id: d.id, isCustom: false } as ZikrItem);
      });
      items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      return items;
    }

    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();
    const seededList: ZikrItem[] = [];

    DEFAULT_ZIKRS.forEach((item, index) => {
      const docRef = doc(db, 'globalZikrs', item.id);
      const zikrData: ZikrItem = {
        ...item,
        order: index + 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      batch.set(docRef, zikrData);
      seededList.push(zikrData);
    });

    await batch.commit();
    return seededList;
  } catch (error) {
    console.error('Failed to seed global zikrs:', error);
    return DEFAULT_ZIKRS.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
  }
}

export async function createGlobalZikr(
  zikr: Omit<ZikrItem, 'id' | 'isCustom'> & { id?: string }
): Promise<ZikrItem> {
  const path = 'globalZikrs';
  try {
    const newId = zikr.id || 'preset-' + Date.now();
    const nowIso = new Date().toISOString();
    const zikrRef = doc(db, 'globalZikrs', newId);

    const newZikr: ZikrItem = {
      ...zikr,
      id: newId,
      isCustom: false,
      order: zikr.order || 999,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(zikrRef, newZikr);
    return newZikr;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGlobalZikr(
  zikrId: string,
  updates: Partial<ZikrItem>
): Promise<void> {
  const path = `globalZikrs/${zikrId}`;
  try {
    const zikrRef = doc(db, 'globalZikrs', zikrId);
    await setDoc(
      zikrRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteGlobalZikr(zikrId: string): Promise<void> {
  const path = `globalZikrs/${zikrId}`;
  try {
    const zikrRef = doc(db, 'globalZikrs', zikrId);
    await deleteDoc(zikrRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function reorderGlobalZikrs(orderedIds: string[]): Promise<void> {
  const path = 'globalZikrs/reorder';
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const zikrRef = doc(db, 'globalZikrs', id);
      batch.update(zikrRef, { order: index + 1, updatedAt: new Date().toISOString() });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

