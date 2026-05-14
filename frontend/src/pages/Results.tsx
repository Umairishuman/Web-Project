import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Award,
  Download,
  ChevronLeft,
  Clock4,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Question {
  _id: string;
  type: 'mcq' | 'subjective';
  text: string;
  marks: number;
  correctOption?: number;
  options?: { label: string; text: string }[];
  modelAnswer?: string;
}

interface Attempt {
  _id: string;
  totalScore: number;
  maxScore: number;
  isGraded: boolean;
  submittedAt: string;
  answers: {
    questionId: string;
    selectedOption: number | null;
    textAnswer: string;
    marksAwarded: number;
  }[];
}

export const Results = () => {
  const { attemptId } = useParams();
  const { showToast } = useToast();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const response = await api.get(`/attempts/${attemptId}`);
      if (response.data.success) {
        setAttempt(response.data.data.attempt);
        setQuestions(response.data.data.questions);
      }
    } catch {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner />;
  if (!attempt) return null;

  const percentage = Math.round((attempt.totalScore / attempt.maxScore) * 100) || 0;
  const passed = percentage >= 60;
  const gradeBand =
    percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
  const correctCount = attempt.answers.filter((a, i) => {
    const q = questions[i];
    return q?.type === 'mcq' && a.selectedOption === q.correctOption;
  }).length;
  const mcqCount = questions.filter((q) => q.type === 'mcq').length;

  const radial = [{ name: 'score', value: percentage, fill: passed ? '#0D9488' : '#EF4444' }];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10" ref={printRef}>
      <PageHeader
        breadcrumbs={[{ label: 'Results' }]}
        title="Your result"
        subtitle={`Submitted on ${new Date(attempt.submittedAt).toLocaleString()}`}
        actions={
          <>
            <Link to="/dashboard" className="btn-ghost">
              <ChevronLeft size={16} /> Back
            </Link>
            <button onClick={downloadPDF} className="btn-primary">
              <Download size={16} /> Download PDF
            </button>
          </>
        }
      />

      {/* Summary */}
      <section className="grid lg:grid-cols-3 gap-5 mb-8">
        <div className="card p-6 lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="75%"
                outerRadius="100%"
                data={radial}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-darknavy">{percentage}%</span>
              <span className="text-xs text-darknavy-500 uppercase tracking-wider">Score</span>
            </div>
          </div>
          <span className={`mt-4 ${passed ? 'badge-success' : 'badge-error'} text-sm`}>
            {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {passed ? 'Passed' : 'Did not pass'}
          </span>
        </div>

        <div className="card p-6 lg:col-span-2 grid sm:grid-cols-3 gap-5">
          <Stat
            label="Total marks"
            value={`${attempt.totalScore} / ${attempt.maxScore}`}
            icon={Award}
          />
          <Stat label="Grade" value={gradeBand} icon={Star} />
          <Stat
            label="MCQs correct"
            value={mcqCount > 0 ? `${correctCount} / ${mcqCount}` : '—'}
            icon={CheckCircle2}
          />
          <Stat
            label="Status"
            value={attempt.isGraded ? 'Graded' : 'Pending'}
            icon={Clock4}
          />
          <Stat label="Questions" value={questions.length} icon={Star} />
          <Stat
            label="Submitted"
            value={new Date(attempt.submittedAt).toLocaleDateString()}
            icon={Clock4}
          />
        </div>
      </section>

      {/* Per-question breakdown */}
      <section>
        <h2 className="section-title mb-1">Per-question breakdown</h2>
        <p className="section-subtitle mb-5">
          Review each question to see your answer and marks awarded.
        </p>

        <div className="space-y-3">
          {questions.map((q, i) => {
            const a = attempt.answers.find((x) => x.questionId === q._id);
            const isCorrect = q.type === 'mcq' && a?.selectedOption === q.correctOption;
            const accent =
              q.type === 'mcq'
                ? isCorrect
                  ? 'border-l-green-500 bg-green-50/40'
                  : 'border-l-red-400 bg-red-50/40'
                : 'border-l-darknavy-300';

            return (
              <article
                key={q._id}
                className={`card p-5 border-l-4 ${accent}`}
              >
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-darknavy">
                      Q{i + 1}. {q.text}
                    </h3>
                    <p className="text-xs text-darknavy-500 mt-0.5">
                      {q.type === 'mcq' ? 'Multiple choice' : 'Subjective'}
                    </p>
                  </div>
                  <span className="badge-neutral">
                    {a?.marksAwarded ?? 0} / {q.marks}
                  </span>
                </header>

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white border border-darknavy-100 p-3">
                    <p className="text-xs uppercase tracking-wider text-darknavy-500 font-medium">
                      Your answer
                    </p>
                    <p className="text-sm text-darknavy mt-1 whitespace-pre-wrap">
                      {q.type === 'mcq'
                        ? a?.selectedOption !== null && a?.selectedOption !== undefined
                          ? `${String.fromCharCode(65 + a.selectedOption)}${
                              q.options ? '. ' + q.options[a.selectedOption]?.text : ''
                            }`
                          : 'Not answered'
                        : a?.textAnswer || 'Not answered'}
                    </p>
                  </div>
                  {q.type === 'mcq' && q.correctOption !== undefined && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                      <p className="text-xs uppercase tracking-wider text-green-700 font-medium">
                        Correct answer
                      </p>
                      <p className="text-sm text-green-900 mt-1">
                        {String.fromCharCode(65 + q.correctOption)}
                        {q.options ? '. ' + q.options[q.correctOption]?.text : ''}
                      </p>
                    </div>
                  )}
                  {q.type === 'subjective' && q.modelAnswer && (
                    <div className="rounded-lg bg-darknavy-50 border border-darknavy-100 p-3">
                      <p className="text-xs uppercase tracking-wider text-darknavy-500 font-medium">
                        Model answer
                      </p>
                      <p className="text-sm text-darknavy-700 mt-1 whitespace-pre-wrap">
                        {q.modelAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const Stat = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Award;
}) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-darknavy-500 font-medium">
      <Icon size={12} /> {label}
    </div>
    <p className="mt-1 font-semibold text-darknavy text-base">{value}</p>
  </div>
);
