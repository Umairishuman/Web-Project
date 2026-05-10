import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Code2,
  Server,
  Database,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader
        breadcrumbs={[{ label: 'About' }]}
        title="About ExamGuard"
        subtitle="A web programming final project from National University of Computer & Emerging Sciences, designed to solve a real problem in modern academic assessment."
      />

      <section className="grid lg:grid-cols-3 gap-6 mb-12">
        <div className="card p-7 lg:col-span-2">
          <span className="badge-primary">Mission</span>
          <h2 className="mt-3 text-xl font-bold text-darknavy">Why we built it</h2>
          <p className="mt-3 text-sm text-darknavy-600 leading-relaxed">
            Online assessment in universities is fragmented across multiple tools — one for
            classrooms, one for quizzes, another for grading, and yet another for analytics.
            ExamGuard brings classroom management, quiz delivery, role-based access, and
            student performance reporting into a single secure platform.
          </p>
          <p className="mt-3 text-sm text-darknavy-600 leading-relaxed">
            Every screen is built to be polished, responsive, and accessible — from the
            countdown-timer quiz interface to the role-aware dashboards and the admin
            console.
          </p>
        </div>

        <div className="card p-7">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
          <h3 className="mt-5 font-bold text-darknavy">The Team</h3>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-darknavy-700 font-medium">Muhammad Umair</span>
              <span className="font-mono text-xs text-darknavy-500">23I-0662</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-darknavy-700 font-medium">Mahad Malik</span>
              <span className="font-mono text-xs text-darknavy-500">23I-0537</span>
            </li>
          </ul>
          <div className="mt-5 pt-5 border-t border-darknavy-100">
            <p className="text-xs uppercase tracking-wider text-darknavy-500 font-medium">
              Course
            </p>
            <p className="mt-1 text-sm font-semibold text-darknavy">
              Web Programming · Spring 2026
            </p>
            <p className="text-xs text-darknavy-500">FAST-NUCES</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="section-title mb-1">Technology stack</h2>
        <p className="section-subtitle mb-6">Modern, well-supported tools chosen for clarity.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Code2, label: 'Frontend', value: 'React 19 + Vite + Tailwind CSS' },
            { icon: Server, label: 'Backend', value: 'Node.js + Express (REST)' },
            { icon: Database, label: 'Database', value: 'MongoDB Atlas + Mongoose' },
            { icon: Lock, label: 'Security', value: 'bcrypt + JWT (HTTP-only cookies)' },
          ].map((t) => (
            <div key={t.label} className="card p-5 card-hover">
              <div className="w-10 h-10 rounded-xl bg-darknavy-50 text-darknavy flex items-center justify-center">
                <t.icon size={18} />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-darknavy-500 font-medium">
                {t.label}
              </p>
              <p className="text-sm font-semibold text-darknavy mt-1">{t.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 md:p-10 bg-gradient-soft border-primary-100">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-darknavy">
                Privacy and security come first.
              </h3>
              <p className="mt-1.5 text-sm text-darknavy-600 max-w-xl">
                Passwords are hashed with bcrypt, sessions use HTTP-only cookies, and every
                protected route is guarded on both client and server.
              </p>
            </div>
          </div>
          <Link to="/register" className="btn-primary btn-lg self-start md:self-center">
            Try ExamGuard <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
