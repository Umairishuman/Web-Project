import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FileText,
  CheckCircle2,
  TrendingUp,
  ClipboardList,
  Plus,
  ArrowRight,
  CalendarClock,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalClasses: number;
  totalQuizzes: number;
  totalAttempts?: number;
  roles?: { admins: number; teachers: number; students: number };
}

interface AttemptSummary {
  _id: string;
  percentage: number;
  totalScore: number;
  maxScore: number;
  isGraded: boolean;
  submittedAt: string | null;
  quizTitle: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [classCount, setClassCount] = useState(0);
  const [studentAttempts, setStudentAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (user.role === 'admin') {
          const r = await api.get('/admin/stats');
          if (r.data.success) setAdminStats(r.data.data);
        } else if (user.role === 'teacher') {
          const r = await api.get('/classes');
          if (r.data.success) setClassCount(r.data.data.classes?.length || 0);
        } else {
          const [cr, ar] = await Promise.all([
            api.get('/classes/student/my'),
            api.get('/attempts/me'),
          ]);
          if (cr.data.success) setClassCount(cr.data.data.classes?.length || 0);
          if (ar.data.success) setStudentAttempts(ar.data.data.attempts || []);
        }
      } catch {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  const studentMetrics = useMemo(() => {
    const submitted = studentAttempts.filter((a) => a.submittedAt);
    const avg = submitted.length
      ? Math.round(submitted.reduce((s, a) => s + a.percentage, 0) / submitted.length)
      : 0;
    const trend = submitted
      .slice()
      .reverse()
      .map((a, i) => ({ idx: `#${i + 1}`, score: a.percentage, label: a.quizTitle }));
    return {
      attempted: submitted.length,
      average: avg,
      pending: studentAttempts.filter((a) => !a.isGraded).length,
      trend,
    };
  }, [studentAttempts]);

  if (loading) return <LoadingSpinner />;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const adminRoleData = adminStats?.roles
    ? [
        { name: 'Students', count: adminStats.roles.students },
        { name: 'Teachers', count: adminStats.roles.teachers },
        { name: 'Admins', count: adminStats.roles.admins },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard' }]}
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle={
          user?.role === 'admin'
            ? 'Platform overview, user management, and activity at a glance.'
            : user?.role === 'teacher'
              ? 'Track your classes, quizzes, and pending grading work.'
              : 'See your enrolled classes, results, and upcoming activity.'
        }
        actions={
          user?.role === 'teacher' ? (
            <Link to="/quiz/create" className="btn-primary">
              <Plus size={16} /> Create Quiz
            </Link>
          ) : user?.role === 'student' ? (
            <Link to="/classes" className="btn-primary">
              <GraduationCap size={16} /> Browse Classes
            </Link>
          ) : (
            <Link to="/admin/users" className="btn-primary">
              <Users size={16} /> Manage Users
            </Link>
          )
        }
      />

      {/* Admin */}
      {user?.role === 'admin' && adminStats && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users" value={adminStats.totalUsers} icon={Users} accent="primary" />
            <StatCard label="Active Users" value={adminStats.activeUsers} icon={CheckCircle2} accent="green" />
            <StatCard label="Classes" value={adminStats.totalClasses} icon={GraduationCap} accent="blue" />
            <StatCard label="Quizzes" value={adminStats.totalQuizzes} icon={FileText} accent="violet" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-semibold text-darknavy">Users by role</h3>
              <p className="text-xs text-darknavy-500 mt-0.5">Live distribution</p>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adminRoleData}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-darknavy">Quick actions</h3>
              <p className="text-xs text-darknavy-500 mt-0.5">Admin tools</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/admin" className="btn-secondary justify-start">
                  <Award size={16} /> Admin overview <ArrowRight size={14} className="ml-auto" />
                </Link>
                <Link to="/admin/users" className="btn-secondary justify-start">
                  <Users size={16} /> Manage users <ArrowRight size={14} className="ml-auto" />
                </Link>
                <Link to="/profile" className="btn-secondary justify-start">
                  <Users size={16} /> Update profile <ArrowRight size={14} className="ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Teacher */}
      {user?.role === 'teacher' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="My Classes" value={classCount} icon={GraduationCap} accent="primary" />
            <StatCard label="Quick Create" value="Quiz" icon={FileText} accent="blue" hint="Open the wizard" />
            <StatCard label="Grading" value="—" icon={ClipboardList} accent="amber" hint="Open a class for details" />
            <StatCard label="Manage" value="Classes" icon={Users} accent="green" />
          </div>
          <EmptyState
            icon={CalendarClock}
            title="Open a class to see analytics"
            description="Per-quiz score distributions, participation rates, and grading queues live on each class and quiz page."
            action={
              <Link to="/classes" className="btn-primary">
                <GraduationCap size={16} /> Go to my classes
              </Link>
            }
          />
        </>
      )}

      {/* Student */}
      {user?.role === 'student' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Enrolled Classes" value={classCount} icon={GraduationCap} accent="primary" />
            <StatCard label="Quizzes Taken" value={studentMetrics.attempted} icon={FileText} accent="blue" />
            <StatCard
              label="Average Score"
              value={studentMetrics.attempted ? `${studentMetrics.average}%` : '—'}
              icon={TrendingUp}
              accent="green"
            />
            <StatCard label="Pending Grading" value={studentMetrics.pending} icon={CalendarClock} accent="amber" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-darknavy">Score trend</h3>
                  <p className="text-xs text-darknavy-500 mt-0.5">
                    {studentMetrics.attempted
                      ? `Across your ${studentMetrics.attempted} attempts`
                      : 'Take a quiz to see your trend'}
                  </p>
                </div>
              </div>
              <div className="h-64">
                {studentMetrics.trend.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentMetrics.trend}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="idx" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number, _k, item) => [`${v}%`, item?.payload?.label]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0D9488"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0D9488' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-darknavy-500">
                    Take 2+ quizzes to see your trend.
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-darknavy">Quick actions</h3>
              <p className="text-xs text-darknavy-500 mt-0.5">Get to common tasks fast</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/classes" className="btn-secondary justify-start">
                  <GraduationCap size={16} /> Join or view classes <ArrowRight size={14} className="ml-auto" />
                </Link>
                <Link to="/results" className="btn-secondary justify-start">
                  <ClipboardList size={16} /> View my results <ArrowRight size={14} className="ml-auto" />
                </Link>
                <Link to="/profile" className="btn-secondary justify-start">
                  <Users size={16} /> Update profile <ArrowRight size={14} className="ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
} as const;
