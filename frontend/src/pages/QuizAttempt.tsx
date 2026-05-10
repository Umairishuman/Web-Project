import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import {
  Clock,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Question {
  _id: string;
  type: 'mcq' | 'subjective';
  text: string;
  options: { label: string; text: string }[];
  marks: number;
}

interface Answer {
  questionId: string;
  selectedOption: number | null;
  textAnswer: string;
  flagged?: boolean;
}

export const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    startAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && attempt && !submitting) {
      showToast('Time up — submitting your attempt', 'info');
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, attempt]);

  useBeforeUnload((e) => {
    if (attempt && !submitting) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  const startAttempt = async () => {
    try {
      const response = await api.post('/attempts', { quizId: id });
      if (response.data.success) {
        const { attempt: att, questions: qs, timeLimit } = response.data.data;
        setAttempt(att);
        setQuestions(qs);
        setTimeLeft(timeLimit * 60);
        setAnswers(
          qs.map((q: Question) => ({
            questionId: q._id,
            selectedOption: null,
            textAnswer: '',
            flagged: false,
          }))
        );
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to start quiz', 'error');
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (qid: string, patch: Partial<Answer>) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === qid ? { ...a, ...patch } : a)));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.put(`/attempts/${attempt._id}/submit`, { answers });
      if (response.data.success) {
        showToast('Quiz submitted', 'success');
        navigate(`/results/${attempt._id}`);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    const answered = answers.filter(
      (a) => a.selectedOption !== null || a.textAnswer.trim().length > 0
    ).length;
    const flagged = answers.filter((a) => a.flagged).length;
    return { answered, flagged, total: answers.length };
  }, [answers]);

  const timeAlmostUp = timeLeft > 0 && timeLeft <= 60;

  if (loading) return <LoadingSpinner label="Starting your attempt..." />;
  if (!questions.length) return null;

  const q = questions[activeIdx];
  const a = answers[activeIdx];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      {/* Sticky exam header */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur border-b border-darknavy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
              <ListChecks size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-darknavy text-sm truncate">Quiz in progress</h1>
              <p className="text-xs text-darknavy-500">
                Question {activeIdx + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold tabular-nums ${
              timeAlmostUp ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-darknavy-50 text-darknavy'
            }`}
            aria-live="polite"
          >
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Question column */}
        <div>
          <article className="card p-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="badge-neutral capitalize">{q.type === 'mcq' ? 'Multiple choice' : 'Subjective'}</span>
                <h2 className="mt-3 text-lg font-semibold text-darknavy leading-relaxed">
                  Q{activeIdx + 1}. {q.text}
                </h2>
                <p className="text-xs text-darknavy-500 mt-1">{q.marks} marks</p>
              </div>
              <button
                onClick={() => updateAnswer(q._id, { flagged: !a.flagged })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  a.flagged
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'border-darknavy-200 text-darknavy-500 hover:text-darknavy'
                }`}
              >
                <Flag size={12} />
                {a.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {q.type === 'mcq' ? (
              <div className="space-y-2.5">
                {q.options.map((opt, i) => {
                  const selected = a.selectedOption === i;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        selected
                          ? 'border-primary bg-primary-50 ring-2 ring-primary/15'
                          : 'border-darknavy-200 hover:border-darknavy-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        checked={selected}
                        onChange={() => updateAnswer(q._id, { selectedOption: i, textAnswer: '' })}
                        className="sr-only"
                      />
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          selected ? 'bg-primary text-white' : 'bg-darknavy-100 text-darknavy-600'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-sm text-darknavy">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={a.textAnswer}
                onChange={(e) => updateAnswer(q._id, { textAnswer: e.target.value, selectedOption: null })}
                placeholder="Type your answer here..."
                className="input"
                rows={8}
              />
            )}
          </article>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="btn-secondary"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            {activeIdx === questions.length - 1 ? (
              <button onClick={() => setConfirmSubmit(true)} className="btn-primary">
                <CheckCircle2 size={16} /> Submit
              </button>
            ) : (
              <button
                onClick={() => setActiveIdx((i) => Math.min(questions.length - 1, i + 1))}
                className="btn-primary"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar — question palette */}
        <aside className="card p-5 h-fit lg:sticky lg:top-32">
          <h3 className="font-semibold text-darknavy text-sm">Question palette</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-darknavy-500">
            <Legend className="bg-primary text-white" label="Active" />
            <Legend className="bg-green-100 text-green-700" label="Done" />
            <Legend className="bg-amber-100 text-amber-700" label="Flagged" />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((qq, i) => {
              const ans = answers[i];
              const answered = ans.selectedOption !== null || ans.textAnswer.trim().length > 0;
              const isActive = i === activeIdx;
              const flagged = ans.flagged;

              const cls = isActive
                ? 'bg-primary text-white border-primary shadow-glow'
                : flagged
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : answered
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-white text-darknavy-500 border-darknavy-200 hover:border-darknavy-400';

              return (
                <button
                  key={qq._id}
                  onClick={() => setActiveIdx(i)}
                  className={`aspect-square rounded-lg border text-sm font-semibold transition-all ${cls}`}
                  aria-label={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-5 border-t border-darknavy-100 space-y-2 text-sm text-darknavy-600">
            <div className="flex justify-between"><span>Answered</span><span className="font-semibold text-darknavy">{stats.answered}/{stats.total}</span></div>
            <div className="flex justify-between"><span>Flagged</span><span className="font-semibold text-darknavy">{stats.flagged}</span></div>
          </div>
          <button
            onClick={() => setConfirmSubmit(true)}
            disabled={submitting}
            className="btn-primary w-full mt-5"
          >
            <CheckCircle2 size={16} /> Submit attempt
          </button>
        </aside>
      </div>

      {/* Submit confirmation */}
      {confirmSubmit && (
        <div
          className="fixed inset-0 z-50 bg-darknavy/40 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setConfirmSubmit(false)}
        >
          <div
            className="card max-w-md w-full p-6 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <h2 className="mt-4 font-bold text-darknavy text-lg">Submit your attempt?</h2>
            <p className="mt-1 text-sm text-darknavy-600">
              You answered <strong>{stats.answered}</strong> of <strong>{stats.total}</strong> questions.
              Submitted attempts cannot be reattempted.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={() => setConfirmSubmit(false)} className="btn-secondary">
                Keep editing
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting</> : 'Yes, submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Legend = ({ className, label }: { className: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-3 h-3 rounded-sm ${className}`} /> {label}
  </div>
);
