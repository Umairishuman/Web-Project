import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  createdAt: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=10`);
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      showToast('User status updated', 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
      showToast('Role updated', 'success');
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-darknavy mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(user._id)}
                    className={`px-3 py-1 rounded text-white ${user.isActive ? 'bg-red-500' : 'bg-green-500'}`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};
