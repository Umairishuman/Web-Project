import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Loader2,
  Save,
  Search,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';

interface Question {
  _id: string;
  type: 'mcq' | 'subjective';
  text: string;
  marks: number;
  correctOption: number;
  options?: { label: string; text: string }[];
}

interface Attempt {
  _id: string;
  studentId: { name: string; email: string };
  answers: {
    questionId: string;
    selectedOption: number | null;
    textAnswer: string;
    marksAwarded: number;
  }[];
  totalScore: number;
  maxScore: number;
  isGraded: boolean;
}

export const QuizResults = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAttempt, setActiveAttempt] = useState<string | null>(null);
  const [grading, setGrading] = useState<Record<string, Record<string, number>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/quizzes/${id}/results`);
      if (response.data.success) {
        setAttempts(response.data.data.attempts);
        setQuestions(response.data.data.questions);
      }
    } catch {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (attemptId: string) => {
    setSavingId(attemptId);
    try {
      const data = questions.map((q) => ({
        questionId: q._id,
        marksAwarded: grading[attemptId]?.[q._id] || 0,
      }));
      const response = await api.patch(`/attempts/${attemptId}/grade`, { grading: data });
      if (response.data.success) {
        showToast('Attempt graded', 'success');
        fetchResults();
      }
    } catch {
      showToast('Failed to grade attempt', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const stats = useMemo(() => {
    if (attempts.length === 0) return { count: 0, avg: 0, pending: 0, graded: 0 };
    const total = attempts.reduce((s, a) => s + (a.totalScore / (a.maxScore || 1)) * 100, 0);
    const pending = attempts.filter((a) => !a.isGraded).length;
    return {
      count: attempts.length,
      avg: Math.round(total / attempts.length),
      pending,
      graded: attempts.length - pending,
    };
  }, [attempts]);

  const distribution = useMemo(() => {
    const buckets = [
      { range: '0–40', students: 0 },
      { range: '40–60', students: 0 },
      { range: '60–80', students: 0 },
      { range: '80–100', students: 0 },
    ];
    attempts.forEach((a) => {
      const pct = (a.totalScore / (a.maxScore || 1)) * 100;
      if (pct < 40) buckets[0].students++;
      else if (pct < 60) buckets[1].students++;
      else if (pct < 80) buckets[2].students++;
      else buckets[3].students++;
    });
    return buckets;
  }, [attempts]);

  const filtered = useMemo(() => {
    return attempts.filter((a) => {
      if (filter === 'pending' && a.isGraded) return false;
      if (filter === 'graded' && !a.isGraded) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.studentId.name.toLowerCase().includes(q) ||
          a.studentId.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [attempts, search, filter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'My Classes', to: '/classes' }, { label: 'Quiz Results' }]}
        title="Quiz results"
        subtitle="Review attempts, grade subjective answers, and analyze performance."
      />

      {attempts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No attempts yet"
          description="Once students attempt this quiz, their submissions will appear here for review and grading."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Attempts" value={stats.count} icon={Users} accent="primary" />
            <StatCard label="Average score" value={`${stats.avg}%`} icon={TrendingUp} accent="green" />
            <StatCard label="Graded" value={stats.graded} icon={CheckCircle2} accent="blue" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} accent="amber" />
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-darknavy">Score distribution</h3>
            <p className="text-xs text-darknavy-500 mt-0.5">Across all attempts</p>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="range" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                    }}
                  />
                  <Bar dataKey="students" fill="#0D9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <div className="relative max-w-sm w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darknavy-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or email"
                className="input pl-9"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-darknavy-200 rounded-xl p-1">
              {([
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'graded', label: 'Graded' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === opt.value
                      ? 'bg-primary text-white'
                      : 'text-darknavy-600 hover:bg-darknavy-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <EmptyState icon={Filter} title="No matches" description="Try a different search or filter." />
            )}
            {filtered.map((attempt) => {
              const pct = Math.round((attempt.totalScore / (attempt.maxScore || 1)) * 100) || 0;
              const isOpen = activeAttempt === attempt._id;
              return (
                <div key={attempt._id} className="card overflow-hidden">
                  <button
                    onClick={() => setActiveAttempt((cur) => (cur === attempt._id ? null : attempt._id))}
                    className="w-full p-5 flex items-center justify-between gap-4 hover:bg-darknavy-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {attempt.studentId.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-darknavy truncate">
                          {attempt.studentId.name}
                        </p>
                        <p className="text-xs text-darknavy-500 truncate">{attempt.studentId.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-darknavy tabular-nums">
                          {attempt.totalScore}
                          <span className="text-sm text-darknavy-400">/{attempt.maxScore}</span>
                        </p>
                        <p className="text-xs text-darknavy-500">{pct}%</p>
                      </div>
                      <span className={attempt.isGraded ? 'badge-success' : 'badge-warning'}>
                        {attempt.isGraded ? 'Graded' : 'Pending'}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-darknavy-100 p-5 bg-darknavy-50/40 space-y-3 animate-fade-in">
                      {questions.map((q, qIndex) => {
                        const ans = attempt.answers.find((a) => a.questionId === q._id);
                        const isMcqCorrect =
                          q.type === 'mcq' && ans?.selectedOption === q.correctOption;
                        return (
                          <div key={q._id} className="bg-white rounded-xl border border-darknavy-100 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-medium text-sm text-darknavy">
                                Q{qIndex + 1}. {q.text}
                              </p>
                              <span className="text-xs text-darknavy-500 shrink-0">
                                {q.marks} marks · {q.type.toUpperCase()}
                              </span>
                            </div>
                            {q.type === 'mcq' ? (
                              <p
                                className={`mt-2 text-sm flex items-center gap-2 ${
                                  isMcqCorrect ? 'text-green-700' : 'text-red-600'
                                }`}
                              >
                                {isMcqCorrect ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                Selected:{' '}
                                {ans?.selectedOption !== null && ans?.selectedOption !== undefined
                                  ? String.fromCharCode(65 + ans.selectedOption)
                                  : 'Not answered'}{' '}
                                · Correct: {String.fromCharCode(65 + q.correctOption)}
                              </p>
                            ) : (
                              <div className="mt-2">
                                <p className="text-sm text-darknavy-700 whitespace-pre-wrap">
                                  {ans?.textAnswer || 'Not answered'}
                                </p>
                                {!attempt.isGraded && (
                                  <div className="mt-3 flex items-center gap-2 text-sm">
                                    <label className="text-darknavy-600">Award marks:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max={q.marks}
                                      value={
                                        grading[attempt._id]?.[q._id] ??
                                        ans?.marksAwarded ??
                                        0
                                      }
                                      onChange={(e) =>
                                        setGrading((prev) => ({
                                          ...prev,
                                          [attempt._id]: {
                                            ...(prev[attempt._id] || {}),
                                            [q._id]: Math.min(
                                              q.marks,
                                              Math.max(0, parseInt(e.target.value) || 0)
                                            ),
                                          },
                                        }))
                                      }
                                      className="input !w-24 !py-1.5"
                                    />
                                    <span className="text-darknavy-500">/ {q.marks}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {!attempt.isGraded && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleGrade(attempt._id)}
                            disabled={savingId === attempt._id}
                            className="btn-primary"
                          >
                            {savingId === attempt._id ? (
                              <><Loader2 size={14} className="animate-spin" /> Saving</>
                            ) : (
                              <><Save size={14} /> Submit grades</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
