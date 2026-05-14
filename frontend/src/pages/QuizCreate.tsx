import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  ListChecks,
  PenLine,
  Settings,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';

interface Question {
  type: 'mcq' | 'subjective';
  text: string;
  options: { label: string; text: string }[];
  correctOption: number | null;
  marks: number;
  modelAnswer: string;
}

const blankQuestion = (): Question => ({
  type: 'mcq',
  text: '',
  options: ['', '', '', ''].map((text, i) => ({ label: String.fromCharCode(65 + i), text })),
  correctOption: null,
  marks: 1,
  modelAnswer: '',
});

export const QuizCreate = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    classId: params.get('classId') || '',
    title: '',
    instructions: '',
    timeLimit: 30,
    scheduledAt: '',
    closesAt: '',
    shuffleQuestions: false,
    showCorrectAnswers: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<Question>(blankQuestion());

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const r = await api.get('/classes');
        if (r.data.success) setClasses(r.data.data.classes);
      } catch {
        // silent
      }
    };
    loadClasses();
  }, []);

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const addQuestion = () => {
    if (!current.text.trim()) return showToast('Question text is required', 'error');
    if (current.type === 'mcq') {
      if (current.options.some((o) => !o.text.trim()))
        return showToast('Fill all MCQ options', 'error');
      if (current.correctOption === null)
        return showToast('Mark the correct option', 'error');
    }
    setQuestions([...questions, current]);
    setCurrent(blankQuestion());
    showToast('Question added', 'success');
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.classId) return showToast('Select a class', 'error');
    if (!formData.title) return showToast('Quiz title is required', 'error');
    if (questions.length === 0) return showToast('Add at least one question', 'error');
    setSubmitting(true);
    try {
      const response = await api.post('/quizzes', {
        ...formData,
        questions,
        status: publish ? 'published' : 'draft',
      });
      if (response.data.success) {
        showToast(publish ? 'Quiz published' : 'Saved as draft', 'success');
        navigate('/classes');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { n: 1, label: 'Details', icon: Settings },
    { n: 2, label: 'Questions', icon: ListChecks },
    { n: 3, label: 'Review', icon: CheckCircle2 },
  ];

  const canNext1 = formData.classId && formData.title && formData.scheduledAt && formData.closesAt;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'My Classes', to: '/classes' }, { label: 'Create Quiz' }]}
        title="Create a new quiz"
        subtitle="Build a quiz in three steps. Save as draft anytime — only published quizzes are visible to students."
      />

      {/* Stepper */}
      <ol className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-darknavy-200 -z-10" />
        {steps.map((s) => {
          const active = s.n === step;
          const done = s.n < step;
          return (
            <li key={s.n} className="flex flex-col items-center gap-2 z-0 bg-surface px-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done
                    ? 'bg-primary border-primary text-white'
                    : active
                      ? 'border-primary text-primary bg-white'
                      : 'border-darknavy-200 text-darknavy-400 bg-white'
                }`}
              >
                {done ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
              </div>
              <span
                className={`text-xs font-medium ${
                  active || done ? 'text-darknavy' : 'text-darknavy-400'
                }`}
              >
                Step {s.n} · {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="card p-7 space-y-5">
          <div>
            <label className="label">Class</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <p className="field-hint">Quizzes are scoped to a class. Students must be enrolled to attempt.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="e.g. Quiz 03 — Sorting"
                required
              />
            </div>
            <div>
              <label className="label">Time limit (minutes)</label>
              <input
                type="number"
                min={1}
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Opens at</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Closes at</label>
              <input
                type="datetime-local"
                value={formData.closesAt}
                onChange={(e) => setFormData({ ...formData, closesAt: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="input"
              rows={3}
              placeholder="Briefly describe what's covered..."
            />
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-darknavy-700">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                className="w-4 h-4 rounded border-darknavy-300 text-primary"
              />
              Shuffle questions
            </label>
            <label className="flex items-center gap-2 text-sm text-darknavy-700">
              <input
                type="checkbox"
                checked={formData.showCorrectAnswers}
                onChange={(e) => setFormData({ ...formData, showCorrectAnswers: e.target.checked })}
                className="w-4 h-4 rounded border-darknavy-300 text-primary"
              />
              Show correct answers in results
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!canNext1}
              onClick={() => setStep(2)}
              className="btn-primary"
            >
              Next: Questions <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-7 space-y-5">
            <h2 className="font-bold text-darknavy">Add a question</h2>
            <div>
              <label className="label">Type</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'mcq', label: 'Multiple Choice', icon: ListChecks },
                  { value: 'subjective', label: 'Subjective', icon: PenLine },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCurrent({ ...current, type: opt.value })}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      current.type === opt.value
                        ? 'border-primary bg-primary-50'
                        : 'border-darknavy-200 hover:border-darknavy-300'
                    }`}
                  >
                    <opt.icon size={18} className={current.type === opt.value ? 'text-primary' : 'text-darknavy-500'} />
                    <span className="font-medium text-sm text-darknavy">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Question text</label>
              <textarea
                value={current.text}
                onChange={(e) => setCurrent({ ...current, text: e.target.value })}
                className="input"
                rows={3}
                placeholder="Type the question..."
                required
              />
            </div>
            {current.type === 'mcq' && (
              <div className="space-y-2">
                <label className="label">Options (mark the correct one)</label>
                {current.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      current.correctOption === i
                        ? 'border-primary bg-primary-50'
                        : 'border-darknavy-200 hover:border-darknavy-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct"
                      checked={current.correctOption === i}
                      onChange={() => setCurrent({ ...current, correctOption: i })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-mono text-xs font-bold w-5 text-darknavy-500">{opt.label}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...current.options];
                        next[i] = { ...next[i], text: e.target.value };
                        setCurrent({ ...current, options: next });
                      }}
                      className="input flex-1 !py-1.5"
                      placeholder={`Option ${opt.label}`}
                    />
                  </label>
                ))}
              </div>
            )}
            {current.type === 'subjective' && (
              <div>
                <label className="label">Model answer (for grader reference)</label>
                <textarea
                  value={current.modelAnswer}
                  onChange={(e) => setCurrent({ ...current, modelAnswer: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Optional — visible to teachers and shown in results if enabled."
                />
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Marks</label>
                <input
                  type="number"
                  min={1}
                  value={current.marks}
                  onChange={(e) => setCurrent({ ...current, marks: parseInt(e.target.value) || 1 })}
                  className="input"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={addQuestion} className="btn-primary">
                <Plus size={16} /> Add question
              </button>
            </div>
          </div>

          <div className="card p-7 h-fit">
            <h3 className="font-bold text-darknavy">Questions added</h3>
            <p className="text-sm text-darknavy-500">{questions.length} · {totalMarks} marks</p>
            {questions.length === 0 ? (
              <p className="mt-4 text-sm text-darknavy-500">Questions will appear here.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-lg border border-darknavy-100 bg-darknavy-50/40"
                  >
                    <span className="font-mono text-xs font-bold text-darknavy-500 mt-0.5">Q{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-darknavy line-clamp-2">{q.text}</p>
                      <p className="text-xs text-darknavy-500 mt-0.5">
                        {q.type === 'mcq' ? 'MCQ' : 'Subjective'} · {q.marks} marks
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="p-1 rounded text-darknavy-400 hover:text-red-500"
                      aria-label="Remove question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => setStep(1)} className="btn-ghost">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={questions.length === 0}
                className="btn-primary"
              >
                Review <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-7">
          <h2 className="font-bold text-darknavy text-lg">Review and publish</h2>
          <p className="text-sm text-darknavy-500">
            Double-check before publishing. You can save as a draft and publish later.
          </p>

          <dl className="mt-5 grid sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <Detail label="Title" value={formData.title} />
            <Detail label="Class" value={classes.find((c) => c._id === formData.classId)?.name || '—'} />
            <Detail label="Time limit" value={`${formData.timeLimit} min`} />
            <Detail label="Total questions" value={`${questions.length} (${totalMarks} marks)`} />
            <Detail label="Opens at" value={formData.scheduledAt ? new Date(formData.scheduledAt).toLocaleString() : '—'} />
            <Detail label="Closes at" value={formData.closesAt ? new Date(formData.closesAt).toLocaleString() : '—'} />
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3 justify-between">
            <button onClick={() => setStep(2)} className="btn-ghost">
              <ChevronLeft size={16} /> Back to questions
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-secondary"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving</> : <><FileText size={14} /> Save as draft</>}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Publishing</> : <><CheckCircle2 size={14} /> Publish quiz</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs uppercase tracking-wider text-darknavy-500 font-medium">{label}</dt>
    <dd className="mt-0.5 font-medium text-darknavy">{value}</dd>
  </div>
);
