import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        showToast('If email exists, reset link sent', 'success');
        setEmail('');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-darknavy mb-6 text-center">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
