import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  GraduationCap,
  User as UserIcon,
  Loader2,
  Power,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/PageHeader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

type Role = 'admin' | 'teacher' | 'student';

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

const roleIcon = {
  admin: ShieldCheck,
  teacher: GraduationCap,
  student: UserIcon,
};

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=10`);
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId: string) => {
    setBusyId(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
      showToast('User status updated', 'success');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (userId: string, newRole: Role) => {
    setBusyId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      showToast('Role updated', 'success');
    } catch {
      showToast('Failed to update role', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Users' }]}
        title="User management"
        subtitle="Activate, deactivate, and change roles for accounts on the platform."
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-darknavy-200 rounded-xl p-1">
          {([
            { v: 'all', l: 'All' },
            { v: 'admin', l: 'Admins' },
            { v: 'teacher', l: 'Teachers' },
            { v: 'student', l: 'Students' },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setRoleFilter(opt.v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === opt.v ? 'bg-primary text-white' : 'text-darknavy-600 hover:bg-darknavy-50'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserIcon} title="No users found" description="Try clearing filters or moving to a different page." />
      ) : (
        <>
          {/* Table — desktop */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-darknavy-50 border-b border-darknavy-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-darknavy-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-darknavy-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-darknavy-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-darknavy-500">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-darknavy-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darknavy-100">
                {filtered.map((u) => {
                  const Icon = roleIcon[u.role];
                  return (
                    <tr key={u._id} className="hover:bg-darknavy-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-darknavy truncate">{u.name}</p>
                            <p className="text-xs text-darknavy-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2">
                          <Icon size={14} className="text-darknavy-400" />
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u._id, e.target.value as Role)}
                            disabled={busyId === u._id}
                            className="input !py-1 !px-2 text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={u.isActive ? 'badge-success' : 'badge-error'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-darknavy-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleStatus(u._id)}
                          disabled={busyId === u._id}
                          className={u.isActive ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
                        >
                          {busyId === u._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <Power size={12} />
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((u) => {
              const Icon = roleIcon[u.role];
              return (
                <div key={u._id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-xs font-bold">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-darknavy truncate">{u.name}</p>
                      <p className="text-xs text-darknavy-500 truncate">{u.email}</p>
                    </div>
                    <span className={u.isActive ? 'badge-success' : 'badge-error'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Icon size={14} className="text-darknavy-400" />
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value as Role)}
                      disabled={busyId === u._id}
                      className="input !py-1.5 !px-2 text-sm flex-1"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => toggleStatus(u._id)}
                      disabled={busyId === u._id}
                      className={u.isActive ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
                    >
                      {busyId === u._id ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-darknavy-500">Page {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary btn-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < 10}
                className="btn-secondary btn-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
