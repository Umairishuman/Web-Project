import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';

interface AttemptSummary {
  _id: string;
  quizId: string;
  quizTitle: string;
  className: string;
  classSubject: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isGraded: boolean;
  submittedAt: string | null;
}

export const MyResults = () => {
  const { showToast } = useToast();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get('/attempts/me');
        if (r.data.success) setAttempts(r.data.data.attempts || []);
      } catch {
        showToast('Failed to load your results', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  const stats = useMemo(() => {
    const submitted = attempts.filter((a) => a.submittedAt);
    if (submitted.length === 0) {
      return { count: 0, average: 0, best: 0, pending: 0 };
    }
    const average = Math.round(
      submitted.reduce((s, a) => s + a.percentage, 0) / submitted.length
    );
    const best = submitted.reduce((m, a) => Math.max(m, a.percentage), 0);
    const pending = attempts.filter((a) => !a.isGraded).length;
    return { count: submitted.length, average, best, pending };
  }, [attempts]);

  const trend = useMemo(() => {
    return attempts
      .filter((a) => a.submittedAt)
      .slice()
      .reverse()
      .map((a, i) => ({
        idx: `#${i + 1}`,
        score: a.percentage,
        label: a.quizTitle,
      }));
  }, [attempts]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'My Results' }]}
        title="My Results"
        subtitle="Review every quiz you've attempted, your scores, and your grading status."
      />

      {attempts.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No attempts yet"
          description="Once you attempt a published quiz, your results will show up here with score breakdowns and trends."
          action={
            <Link to="/classes" className="btn-primary">
              <GraduationCap size={16} /> Go to My Classes
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Quizzes taken" value={stats.count} icon={FileText} accent="primary" />
            <StatCard label="Average score" value={`${stats.average}%`} icon={TrendingUp} accent="green" />
            <StatCard label="Best score" value={`${stats.best}%`} icon={Award} accent="violet" />
            <StatCard label="Pending grading" value={stats.pending} icon={Clock} accent="amber" />
          </div>

          {trend.length >= 2 && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-darknavy">Score trend</h3>
              <p className="text-xs text-darknavy-500 mt-0.5">Across your submitted attempts</p>
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="idx" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                      }}
                      formatter={(value: number, _key, item) => [`${value}%`, item?.payload?.label]}
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
              </div>
            </div>
          )}

          <section className="card overflow-hidden">
            <header className="px-6 py-4 border-b border-darknavy-100 flex items-center justify-between">
              <h3 className="font-semibold text-darknavy">All attempts</h3>
              <span className="text-xs text-darknavy-500">{attempts.length} total</span>
            </header>
            <ul className="divide-y divide-darknavy-100">
              {attempts.map((a) => {
                const submitted = a.submittedAt ? new Date(a.submittedAt) : null;
                return (
                  <li
                    key={a._id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between hover:bg-darknavy-50/40"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-darknavy truncate">{a.quizTitle}</p>
                      <p className="text-xs text-darknavy-500 truncate">
                        {a.className} · {a.classSubject}
                        {submitted && ` · ${submitted.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-base font-bold text-darknavy tabular-nums">
                          {a.totalScore}
                          <span className="text-sm text-darknavy-400">/{a.maxScore}</span>
                        </p>
                        <p className="text-xs text-darknavy-500">{a.percentage}%</p>
                      </div>
                      <span className={a.isGraded ? 'badge-success' : 'badge-warning'}>
                        {a.isGraded ? (
                          <>
                            <CheckCircle2 size={12} /> Graded
                          </>
                        ) : (
                          <>
                            <Clock size={12} /> Pending
                          </>
                        )}
                      </span>
                      <Link to={`/results/${a._id}`} className="btn-secondary btn-sm">
                        View <ArrowRight size={12} />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};
