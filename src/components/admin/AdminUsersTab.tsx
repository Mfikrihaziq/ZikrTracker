import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { PREDEFINED_ADMIN_EMAIL } from '../../firebase/service';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { user, fetchUsersList, toggleUserRole } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Role toggle confirmation modal state
  const [confirmUser, setConfirmUser] = useState<UserProfile | null>(null);
  const [confirmTargetRole, setConfirmTargetRole] = useState<'admin' | 'user'>('admin');
  const [processingRole, setProcessingRole] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await fetchUsersList();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handlePromptToggleRole = (targetUser: UserProfile) => {
    const isCurrentlyAdmin =
      targetUser.role === 'admin' ||
      Boolean(targetUser.email && targetUser.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase());
    const newRole: 'admin' | 'user' = isCurrentlyAdmin ? 'user' : 'admin';

    setConfirmUser(targetUser);
    setConfirmTargetRole(newRole);
  };

  const handleExecuteToggleRole = async () => {
    if (!confirmUser) return;
    try {
      setProcessingRole(true);
      await toggleUserRole(confirmUser.userId, confirmTargetRole);
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === confirmUser.userId ? { ...u, role: confirmTargetRole } : u
        )
      );
      setConfirmUser(null);
    } catch (err) {
      console.error('Role update error:', err);
    } finally {
      setProcessingRole(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.userId.toLowerCase().includes(q);

    const isUserAdmin =
      u.role === 'admin' ||
      Boolean(u.email && u.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase());

    if (!matchesQuery) return false;
    if (roleFilter === 'admin') return isUserAdmin;
    if (roleFilter === 'user') return !isUserAdmin;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Reload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            User Management & RBAC Privileges
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search registered seekers, monitor dhikr commitment, and grant administrator capabilities
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload Users
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl text-xs border border-stone-200 dark:border-slate-800 bg-white dark:bg-[#121820] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Role Segment Tabs */}
        <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-[#121820] p-1 rounded-2xl border border-stone-300/60 dark:border-emerald-500/20 self-stretch sm:self-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setRoleFilter('user')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'user'
                ? 'bg-white dark:bg-[#1A232E] text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Seekers
          </button>
        </div>
      </div>

      {/* Responsive Users Table */}
      <div className="rounded-3xl bg-white dark:bg-[#121820] border border-stone-200/80 dark:border-emerald-500/20 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-emerald-500/15 bg-stone-50/50 dark:bg-[#161E28]/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 sm:px-6">User Account</th>
                <th className="py-3.5 px-4">Role & Access</th>
                <th className="py-3.5 px-4">Recitations</th>
                <th className="py-3.5 px-4">Streak & Goal</th>
                <th className="py-3.5 px-4">Joined / Active</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800/80">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                    Fetching user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No users matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isUserAdmin =
                    item.role === 'admin' ||
                    Boolean(item.email && item.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase());
                  const isCurrentUser = user && user.uid === item.userId;
                  const isRootPredefinedAdmin =
                    Boolean(item.email && item.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL.toLowerCase());

                  return (
                    <tr
                      key={item.userId}
                      className="hover:bg-stone-50/70 dark:hover:bg-[#161F2A]/60 transition-colors"
                    >
                      {/* Account Column */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {item.photoURL ? (
                            <img
                              src={item.photoURL}
                              alt={item.displayName || 'User'}
                              className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              {item.displayName ? item.displayName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                              {item.displayName || 'Seeker'}
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-slate-800 text-[10px] text-slate-500 font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                              {item.email || 'No email attached'}
                            </p>
                            <button
                              onClick={() => handleCopyUid(item.userId)}
                              className="mt-0.5 text-[10px] font-mono text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                              title="Copy UID"
                            >
                              <span>{item.userId.slice(0, 10)}...</span>
                              {copiedUid === item.userId ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-60" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-4">
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700">
                            Seeker
                          </span>
                        )}
                      </td>

                      {/* Recitations Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {(item.totalCount || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Streak & Goal Column */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                            <Flame className={`w-3.5 h-3.5 ${item.streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                            <span>{item.streak || 0} days</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Goal: {item.dailyGoal || 100} / day
                          </span>
                        </div>
                      </td>

                      {/* Joined / Active Date */}
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.lastActiveDate || item.createdAt?.slice(0, 10) || 'Recent'}</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {isCurrentUser ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Current Session
                          </span>
                        ) : isRootPredefinedAdmin ? (
                          <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium">
                            System Admin
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePromptToggleRole(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                              isUserAdmin
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                            }`}
                          >
                            {isUserAdmin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Toggle Confirmation Modal */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#FAF9F6] dark:bg-[#121820] border border-stone-200 dark:border-emerald-500/20 shadow-2xl p-6">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
              confirmTargetRole === 'admin'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}>
              {confirmTargetRole === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {confirmTargetRole === 'admin'
                ? 'Grant Administrator Privileges?'
                : 'Revoke Administrator Access?'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Are you sure you want to {confirmTargetRole === 'admin' ? 'promote' : 'demote'}{' '}
              <strong>{confirmUser.displayName || confirmUser.email || 'this user'}</strong>?
              {confirmTargetRole === 'admin'
                ? ' This user will gain full access to the Admin Panel, analytics, global presets, and user management.'
                : ' This user will return to standard seeker permissions and will lose access to the Admin Panel.'}
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setConfirmUser(null)}
                disabled={processingRole}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteToggleRole}
                disabled={processingRole}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 ${
                  confirmTargetRole === 'admin'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {processingRole
                  ? 'Updating...'
                  : confirmTargetRole === 'admin'
                  ? 'Confirm Promotion'
                  : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
