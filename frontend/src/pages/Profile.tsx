import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export const Profile = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', profilePhoto: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, profilePhoto: user.profilePhoto || '' });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        showToast('Profile updated successfully', 'success');
        // Update local user data
        localStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/change-password', passwordData);
      if (response.data.success) {
        showToast('Password changed successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '' });
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-darknavy mb-6">Profile</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                type="text"
                value={user?.role}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 bg-red-50 p-6 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
