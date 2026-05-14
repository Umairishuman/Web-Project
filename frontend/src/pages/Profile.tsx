import { useEffect, useState } from 'react';
import { Loader2, Mail, ShieldCheck, Save, KeyRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { validatePassword } from '../utils/validators';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', profilePhoto: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, profilePhoto: user.profilePhoto || '' });
    }
  }, [user]);

  const initials = user?.name
    ?.split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        showToast('Profile updated successfully', 'success');
        updateUser(formData);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(passwordData.newPassword)) {
      setPwError('New password must be 8+ chars with one uppercase and one number');
      return;
    }
    setPwError('');
    setSavingPassword(true);
    try {
      const response = await api.put('/users/change-password', passwordData);
      if (response.data.success) {
        showToast('Password changed successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '' });
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'Profile' }]}
        title="Account settings"
        subtitle="Manage your profile, change your password, and review account info."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <div className="card p-7 lg:col-span-1 h-fit">
          <div className="flex items-center gap-4">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-bold text-darknavy truncate">{user?.name}</h2>
              <span className="badge-primary capitalize">{user?.role}</span>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-darknavy-100 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-darknavy-600">
              <Mail size={16} className="text-darknavy-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-darknavy-600">
              <ShieldCheck size={16} className="text-darknavy-400" />
              <span>JWT session active</span>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileUpdate} className="card p-7">
            <h3 className="font-bold text-darknavy">Edit profile</h3>
            <p className="text-sm text-darknavy-500 mt-0.5">
              Update your display name and profile photo URL.
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email <span className="text-darknavy-400">(read-only)</span></label>
                <input id="email" type="email" value={user?.email || ''} disabled className="input bg-darknavy-50 cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="profilePhoto" className="label">Profile photo URL</label>
                <input
                  id="profilePhoto"
                  type="url"
                  value={formData.profilePhoto}
                  onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
                <p className="field-hint">Paste a public image URL — leave blank to use your initials.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save changes</>
                )}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordChange} className="card p-7">
            <h3 className="font-bold text-darknavy flex items-center gap-2">
              <KeyRound size={18} className="text-darknavy-400" /> Change password
            </h3>
            <p className="text-sm text-darknavy-500 mt-0.5">
              Use a strong password with at least 8 characters, one uppercase, and one number.
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className={`input ${pwError ? 'input-error' : ''}`}
                  required
                />
                {pwError && <p className="field-error">{pwError}</p>}
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={savingPassword} className="btn-primary">
                {savingPassword ? (
                  <><Loader2 size={16} className="animate-spin" /> Updating...</>
                ) : (
                  'Update password'
                )}
              </button>
            </div>
          </form>

          <div className="card p-7 border-red-200 bg-red-50/40">
            <h3 className="font-bold text-red-700">Sign out</h3>
            <p className="text-sm text-darknavy-600 mt-0.5">
              You'll need to sign in again to access your dashboard.
            </p>
            <button onClick={handleLogout} className="btn-danger mt-4">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
