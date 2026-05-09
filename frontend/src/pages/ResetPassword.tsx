import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      if (response.data.success) {
        showToast('Password reset successful', 'success');
        navigate('/login');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-darknavy mb-6 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
