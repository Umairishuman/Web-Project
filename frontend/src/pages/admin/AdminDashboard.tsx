import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/PageHeader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatCard } from '../../components/StatCard';

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalClasses: number;
  totalQuizzes: number;
  activeUsers: number;
  totalAttempts?: number;
  roles?: { admins: number; teachers: number; students: number };
  recentUsers?: RecentUser[];
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch {
        showToast('Failed to fetch platform stats', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) return <LoadingSpinner />;

  const inactive = (stats?.totalUsers || 0) - (stats?.activeUsers || 0);

  const userPieData = [
    { name: 'Active', value: stats?.activeUsers || 0, color: '#0D9488' },
    { name: 'Inactive', value: Math.max(0, inactive), color: '#E2E8F0' },
  ];

  const platformBarData = [
    { name: 'Users', count: stats?.totalUsers || 0 },
    { name: 'Classes', count: stats?.totalClasses || 0 },
    { name: 'Quizzes', count: stats?.totalQuizzes || 0 },
    { name: 'Attempts', count: stats?.totalAttempts || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }]}
        title="Admin overview"
        subtitle={`Platform stats and user management. Signed in as ${user?.name}.`}
        actions={
          <Link to="/admin/users" className="btn-primary">
            <Users size={16} /> Manage users
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} accent="primary" />
        <StatCard label="Active Users" value={stats?.activeUsers || 0} icon={CheckCircle2} accent="green" />
        <StatCard label="Classes" value={stats?.totalClasses || 0} icon={GraduationCap} accent="blue" />
        <StatCard label="Attempts" value={stats?.totalAttempts || 0} icon={ClipboardList} accent="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-darknavy">Platform totals</h3>
          <p className="text-xs text-darknavy-500 mt-0.5">Users, classes, quizzes, attempts</p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBarData}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-darknavy">User activity</h3>
          <p className="text-xs text-darknavy-500 mt-0.5">Active vs inactive accounts</p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {userPieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {stats?.recentUsers && stats.recentUsers.length > 0 && (
        <div className="card overflow-hidden mb-8">
          <header className="px-6 py-4 border-b border-darknavy-100">
            <h3 className="font-semibold text-darknavy">Recently joined</h3>
            <p className="text-xs text-darknavy-500 mt-0.5">Latest 5 accounts</p>
          </header>
          <ul className="divide-y divide-darknavy-100">
            {stats.recentUsers.map((u) => (
              <li key={u._id} className="px-6 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-darknavy truncate">{u.name}</p>
                  <p className="text-xs text-darknavy-500 truncate">{u.email}</p>
                </div>
                <span className="badge-neutral capitalize">{u.role}</span>
                <span className={u.isActive ? 'badge-success' : 'badge-error'}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/admin/users" className="card p-6 card-hover flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
            <Users size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-darknavy">Manage users</p>
            <p className="text-xs text-darknavy-500">Activate, deactivate, change roles</p>
          </div>
          <ArrowRight size={16} className="text-darknavy-400 group-hover:text-primary transition-colors" />
        </Link>
        <Link to="/profile" className="card p-6 card-hover flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-darknavy">Account settings</p>
            <p className="text-xs text-darknavy-500">Update your profile & password</p>
          </div>
          <ArrowRight size={16} className="text-darknavy-400 group-hover:text-primary transition-colors" />
        </Link>
        <Link to="/" className="card p-6 card-hover flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-darknavy">Public site</p>
            <p className="text-xs text-darknavy-500">Visit the landing page</p>
          </div>
          <ArrowRight size={16} className="text-darknavy-400 group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
};
