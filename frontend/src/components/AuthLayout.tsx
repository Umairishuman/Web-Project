import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-surface">
      {/* Left — Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">ExamGuard</span>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-darknavy tracking-tight">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-darknavy-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-sm text-darknavy-600">{footer}</div>}
        </div>
      </div>

      {/* Right — Decorative panel */}
      <div className="relative hidden lg:flex items-center justify-center bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
        <div className="relative max-w-md px-10 py-16">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">ExamGuard</span>
          </Link>

          <h2 className="text-3xl font-bold tracking-tight font-display">
            Run secure exams.
            <span className="block text-primary-300">Get powerful insights.</span>
          </h2>
          <p className="mt-4 text-white/80 leading-relaxed">
            Create classes, schedule quizzes, auto-grade MCQs, and track student progress —
            all from one polished, role-aware platform.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'JWT sessions with HTTP-only cookies',
              'Role-based access for admin, teacher, student',
              'Recharts-powered analytics dashboards',
              'PDF result downloads',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                <CheckCircle2 size={18} className="text-primary-300 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
