import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { AuthLayout } from '../components/AuthLayout';
import { validatePassword } from '../utils/validators';
import api from '../services/api';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!validatePassword(password)) next.password = 'Min 8 chars, 1 uppercase, 1 number';
    if (password !== confirmPassword) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      if (response.data.success) {
        showToast('Password reset successful — please sign in', 'success');
        navigate('/login');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password to secure your ExamGuard account."
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label" htmlFor="password">New password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-darknavy-400 hover:text-darknavy rounded-md"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {[
                { ok: checks.length, label: '8+ chars' },
                { ok: checks.uppercase, label: '1 uppercase' },
                { ok: checks.number, label: '1 number' },
              ].map((c) => (
                <span
                  key={c.label}
                  className={`inline-flex items-center gap-1 ${
                    c.ok ? 'text-green-600' : 'text-darknavy-400'
                  }`}
                >
                  <CheckCircle2 size={12} /> {c.label}
                </span>
              ))}
            </div>
          )}
          {errors.password && <p className="field-error"><AlertCircle size={12} /> {errors.password}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input pl-9 ${errors.confirm ? 'input-error' : ''}`}
              placeholder="Re-enter password"
            />
          </div>
          {errors.confirm && <p className="field-error"><AlertCircle size={12} /> {errors.confirm}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Resetting...</>
          ) : (
            'Reset password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
