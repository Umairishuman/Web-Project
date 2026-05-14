import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  GraduationCap,
  BookOpenCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { AuthLayout } from '../components/AuthLayout';
import { validateEmail, validateName, validatePassword } from '../utils/validators';
import api from '../services/api';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password]
  );

  const passwordStrength = useMemo(() => {
    const score = Object.values(passwordChecks).filter(Boolean).length;
    if (score === 0) return { label: '', width: '0%', color: '' };
    if (score === 1) return { label: 'Weak', width: '33%', color: 'bg-red-400' };
    if (score === 2) return { label: 'Okay', width: '66%', color: 'bg-amber-400' };
    return { label: 'Strong', width: '100%', color: 'bg-green-500' };
  }, [passwordChecks]);

  const validate = () => {
    const next: typeof errors = {};
    if (!validateName(name)) next.name = 'Name must be at least 2 characters';
    if (!email) next.email = 'Email is required';
    else if (!validateEmail(email)) next.email = 'Enter a valid email';
    if (!validatePassword(password))
      next.password = 'Min 8 characters, one uppercase, one number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      if (response.data.success) {
        login(response.data.data.user);
        showToast('Welcome to ExamGuard!', 'success');
        navigate('/dashboard');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ExamGuard as a student or teacher in less than a minute."
      footer={
        <div className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label">I am joining as</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'student', label: 'Student', icon: GraduationCap, hint: 'Take quizzes' },
              { value: 'teacher', label: 'Teacher', icon: BookOpenCheck, hint: 'Run quizzes' },
            ] as const).map((opt) => {
              const active = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-primary bg-primary-50 ring-2 ring-primary/20'
                      : 'border-darknavy-200 hover:border-darknavy-300'
                  }`}
                >
                  <opt.icon size={18} className={active ? 'text-primary' : 'text-darknavy-500'} />
                  <span className="mt-2 font-semibold text-sm text-darknavy">{opt.label}</span>
                  <span className="text-xs text-darknavy-500">{opt.hint}</span>
                  {active && (
                    <CheckCircle2 size={16} className="absolute top-3 right-3 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="label">Full name</label>
          <div className="relative">
            <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input pl-9 ${errors.name ? 'input-error' : ''}`}
              placeholder="Jane Doe"
            />
          </div>
          {errors.name && <p className="field-error"><AlertCircle size={12} /> {errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
              placeholder="you@university.edu"
            />
          </div>
          {errors.email && <p className="field-error"><AlertCircle size={12} /> {errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
            <div className="mt-2">
              <div className="h-1 rounded-full bg-darknavy-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${passwordStrength.color}`}
                  style={{ width: passwordStrength.width }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {[
                  { ok: passwordChecks.length, label: '8+ characters' },
                  { ok: passwordChecks.uppercase, label: '1 uppercase' },
                  { ok: passwordChecks.number, label: '1 number' },
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
            </div>
          )}

          {errors.password && (
            <p className="field-error"><AlertCircle size={12} /> {errors.password}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-xs text-darknavy-500 text-center">
          By creating an account you agree to our terms of use.
        </p>
      </form>
    </AuthLayout>
  );
};
