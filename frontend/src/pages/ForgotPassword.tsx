import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { AuthLayout } from '../components/AuthLayout';
import { validateEmail } from '../utils/validators';
import api from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll email you a one-time link to reset it. Links expire in 15 minutes."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-primary hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      }
    >
      {submitted ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <h3 className="mt-4 font-semibold text-darknavy">Check your inbox</h3>
          <p className="mt-1 text-sm text-darknavy-600">
            If an account exists for <span className="font-medium">{email}</span>, you'll receive a
            reset link shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input pl-9 ${error ? 'input-error' : ''}`}
                placeholder="you@example.com"
                required
              />
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Sending...</>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
