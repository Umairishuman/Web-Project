import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Question {
  _id: string;
  type: 'mcq' | 'subjective';
  text: string;
  options: { label: string; text: string }[];
  marks: number;
}

export const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOption: number | null; textAnswer: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startAttempt();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && attempt) {
      handleSubmit();
    }
  }, [timeLeft]);

  const startAttempt = async () => {
    try {
      const response = await api.post('/attempts', { quizId: id });
      if (response.data.success) {
        const { attempt: att, questions: qs, timeLimit } = response.data.data;
        setAttempt(att);
        setQuestions(qs);
        setTimeLeft(timeLimit * 60);
        setAnswers(qs.map((q: Question) => ({ questionId: q._id, selectedOption: null, textAnswer: '' })));
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to start quiz', 'error');
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, selectedOption: number | null, textAnswer: string) => {
    setAnswers(answers.map(a => 
      a.questionId === questionId ? { ...a, selectedOption, textAnswer } : a
    ));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.put(`/attempts/${attempt._id}/submit`, { answers });
      if (response.data.success) {
        showToast('Quiz submitted successfully', 'success');
        navigate(`/results/${attempt._id}`);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-darknavy">Quiz Attempt</h1>
        <div className="text-xl font-bold text-red-500">{formatTime(timeLeft)}</div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">
              Q{index + 1}. {question.text} ({question.marks} marks)
            </h3>
            {question.type === 'mcq' ? (
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      checked={answers.find(a => a.questionId === question._id)?.selectedOption === i}
                      onChange={() => handleAnswerChange(question._id, i, '')}
                      className="w-4 h-4"
                    />
                    <span>{opt.label}. {opt.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers.find(a => a.questionId === question._id)?.textAnswer || ''}
                onChange={(e) => handleAnswerChange(question._id, null, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
};
