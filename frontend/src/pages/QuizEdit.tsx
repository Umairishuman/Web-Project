import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Question {
  type: 'mcq' | 'subjective';
  text: string;
  options: { label: string; text: string }[];
  correctOption: number | null;
  marks: number;
  modelAnswer: string;
}

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      if (response.data.success) {
        const { quiz, questions: q } = response.data.data;
        setFormData({
          title: quiz.title,
          instructions: quiz.instructions,
          timeLimit: quiz.timeLimit,
          scheduledAt: quiz.scheduledAt,
          closesAt: quiz.closesAt,
          shuffleQuestions: quiz.shuffleQuestions,
          showCorrectAnswers: quiz.showCorrectAnswers,
        });
        setQuestions(q);
      }
    } catch (error) {
      showToast('Failed to fetch quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/quizzes/${id}`, {
        ...formData,
        questions,
      });
      if (response.data.success) {
        showToast('Quiz updated successfully', 'success');
        navigate('/classes');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update quiz', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-darknavy mb-6">Edit Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scheduled At</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Closes At</label>
              <input
                type="datetime-local"
                value={formData.closesAt}
                onChange={(e) => setFormData({ ...formData, closesAt: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Questions ({questions.length})</h2>
          <p className="text-gray-500">Edit questions by recreating the quiz with updated questions.</p>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition"
        >
          Update Quiz
        </button>
      </form>
    </div>
  );
};
