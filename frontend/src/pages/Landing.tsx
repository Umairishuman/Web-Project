import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  GraduationCap,
  Clock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Users,
  FileText,
  LineChart,
  Lock,
  Sparkles,
} from 'lucide-react';

export const Landing = () => {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
        <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur">
                <Sparkles size={12} className="text-primary-300" />
                Web Programming Final Project · 2026
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-balance">
                Secure online exams,
                <span className="block bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">
                  done beautifully.
                </span>
              </h1>
              <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
                ExamGuard unifies classroom management, quiz delivery, and student
                analytics into a single secure platform — built for teachers, students,
                and administrators.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="btn btn-lg bg-primary text-white hover:bg-primary-700 shadow-glow"
                >
                  Get started free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur"
                >
                  Learn more
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-primary-300" /> JWT-secured sessions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-primary-300" /> Auto-graded MCQs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-primary-300" /> PDF result export
                </span>
              </div>
            </div>

            {/* Hero illustration card */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-8 -right-6 w-72 h-72 rounded-full bg-primary-500/30 blur-3xl" />
              <div className="absolute -bottom-12 -left-4 w-72 h-72 rounded-full bg-primary-700/30 blur-3xl" />
              <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-elevated">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-white/60 font-mono">examguard.app</span>
                </div>

                <div className="rounded-2xl bg-white text-darknavy p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-darknavy">Algorithms · Quiz 03</h3>
                    <span className="badge-primary">Live</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-darknavy-50 mb-3">
                    <span className="text-sm font-medium">Time Remaining</span>
                    <span className="font-mono text-lg font-bold text-primary">12:45</span>
                  </div>
                  <p className="text-sm font-medium text-darknavy mb-3">
                    Q1. Which sorting algorithm has O(n log n) average time complexity?
                  </p>
                  <div className="space-y-2">
                    {[
                      { letter: 'A', text: 'Bubble Sort', selected: false },
                      { letter: 'B', text: 'Quick Sort', selected: true },
                      { letter: 'C', text: 'Selection Sort', selected: false },
                    ].map((opt) => (
                      <div
                        key={opt.letter}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${
                          opt.selected
                            ? 'bg-primary-50 border-primary text-primary-800'
                            : 'border-darknavy-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            opt.selected
                              ? 'bg-primary text-white'
                              : 'bg-darknavy-100 text-darknavy-600'
                          }`}
                        >
                          {opt.letter}
                        </div>
                        {opt.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Score', value: '92%' },
                    { label: 'Done', value: '14/20' },
                    { label: 'Class', value: 'CS-A' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-white/10 border border-white/20 px-3 py-2.5"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-white/60">{s.label}</p>
                      <p className="text-base font-bold text-white">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge-primary">Built for everyone</span>
          <h2 className="mt-3 section-title">One platform, three powerful roles.</h2>
          <p className="section-subtitle">
            Tailored experiences with role-based access control on every route.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: 'For Teachers',
              accent: 'bg-primary-50 text-primary-700',
              points: [
                'Create classes with auto-generated join codes',
                'Build MCQ + subjective quizzes with timers',
                'Grade and publish results in one place',
              ],
            },
            {
              icon: Users,
              title: 'For Students',
              accent: 'bg-blue-50 text-blue-700',
              points: [
                'Join classes by 6-character code',
                'Attempt quizzes with live countdown timer',
                'View per-question breakdown and download PDF',
              ],
            },
            {
              icon: ShieldCheck,
              title: 'For Admins',
              accent: 'bg-violet-50 text-violet-700',
              points: [
                'Activate, deactivate, and manage all users',
                'Promote roles and audit account state',
                'View platform-wide statistics at a glance',
              ],
            },
          ].map((role) => (
            <div key={role.title} className="card p-7 card-hover">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role.accent}`}>
                <role.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-darknavy">{role.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {role.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-darknavy-600">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-darknavy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
            <div className="lg:col-span-1">
              <span className="badge-primary">Features</span>
              <h2 className="mt-3 section-title">Everything you need to assess.</h2>
              <p className="section-subtitle max-w-md">
                A focused feature set, built around the realities of online assessment in
                academic settings.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Lock,
                  title: 'Secure auth',
                  body: 'bcrypt-hashed passwords, HTTP-only JWT cookies, and role guards on every route.',
                },
                {
                  icon: Clock,
                  title: 'Live countdown',
                  body: 'Synchronized timers with auto-submission when the clock hits zero.',
                },
                {
                  icon: FileText,
                  title: 'Mixed questions',
                  body: 'MCQ for instant grading and subjective questions with manual review.',
                },
                {
                  icon: BarChart3,
                  title: 'Analytics',
                  body: 'Per-quiz score distributions, participation rates, and progress trends.',
                },
                {
                  icon: LineChart,
                  title: 'Result reports',
                  body: 'Per-question breakdowns and downloadable PDF reports for students.',
                },
                {
                  icon: Sparkles,
                  title: 'Anonymous feedback',
                  body: 'Students can comment on announcements without revealing identity.',
                },
              ].map((f) => (
                <div key={f.title} className="card p-5 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                    <f.icon size={18} />
                  </div>
                  <h3 className="mt-4 font-semibold text-darknavy">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-darknavy-500 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Ready to run your next exam with confidence?
              </h3>
              <p className="mt-2 text-white/80 max-w-xl">
                Sign up in under a minute. Set up your class, share the join code, and
                publish your first quiz today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-lg bg-white text-darknavy hover:bg-darknavy-100">
                Create account
              </Link>
              <Link
                to="/login"
                className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/15"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
