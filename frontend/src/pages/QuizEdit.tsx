import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, FileText, Pencil } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    timeLimit: 30,
    scheduledAt: '',
    closesAt: '',
    shuffleQuestions: false,
    showCorrectAnswers: false,
  });
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}`);
        if (response.data.success) {
          const { quiz, questions } = response.data.data;
          setFormData({
            title: quiz.title || '',
            instructions: quiz.instructions || '',
            timeLimit: quiz.timeLimit || 30,
            scheduledAt: quiz.scheduledAt ? quiz.scheduledAt.slice(0, 16) : '',
            closesAt: quiz.closesAt ? quiz.closesAt.slice(0, 16) : '',
            shuffleQuestions: !!quiz.shuffleQuestions,
            showCorrectAnswers: !!quiz.showCorrectAnswers,
          });
          setQuestionCount(questions?.length || 0);
        }
      } catch {
        showToast('Failed to fetch quiz', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put(`/quizzes/${id}`, formData);
      if (response.data.success) {
        showToast('Quiz updated successfully', 'success');
        navigate('/classes');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update quiz', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'My Classes', to: '/classes' }, { label: 'Edit Quiz' }]}
        title="Edit quiz"
        subtitle="Update timing, instructions, and behavior. Question editing requires recreating the quiz."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-7">
          <h2 className="font-bold text-darknavy flex items-center gap-2">
            <Pencil size={18} className="text-darknavy-400" /> Quiz details
          </h2>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Time limit (minutes)</label>
              <input
                type="number"
                min={1}
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })
                }
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Total questions</label>
              <input value={questionCount} readOnly className="input bg-darknavy-50 cursor-not-allowed" />
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
            <div className="sm:col-span-2">
              <label className="label">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="input"
                rows={4}
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-darknavy-700">
                <input
                  type="checkbox"
                  checked={formData.shuffleQuestions}
                  onChange={(e) =>
                    setFormData({ ...formData, shuffleQuestions: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-darknavy-300 text-primary"
                />
                Shuffle questions
              </label>
              <label className="flex items-center gap-2 text-sm text-darknavy-700">
                <input
                  type="checkbox"
                  checked={formData.showCorrectAnswers}
                  onChange={(e) =>
                    setFormData({ ...formData, showCorrectAnswers: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-darknavy-300 text-primary"
                />
                Show correct answers in results
              </label>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-amber-50/50 border-amber-200">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            <FileText size={16} /> Editing questions
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            To change question content, create a new quiz. This protects integrity for students who
            may have already attempted.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving</> : <><Save size={16} /> Save changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};
