import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const QuizCreate = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    instructions: '',
    timeLimit: 30,
    scheduledAt: '',
    closesAt: '',
    shuffleQuestions: false,
    showCorrectAnswers: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    type: 'mcq',
    text: '',
    options: ['', '', '', ''].map((text, i) => ({ label: String.fromCharCode(65 + i), text })),
    correctOption: null,
    marks: 1,
    modelAnswer: '',
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.text) {
      showToast('Question text is required', 'error');
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      type: 'mcq',
      text: '',
      options: ['', '', '', ''].map((text, i) => ({ label: String.fromCharCode(65 + i), text })),
      correctOption: null,
      marks: 1,
      modelAnswer: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/quizzes', {
        ...formData,
        questions,
      });
      if (response.data.success) {
        showToast('Quiz created successfully', 'success');
        navigate('/classes');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create quiz', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-darknavy mb-6">Create Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class ID</label>
              <input
                type="text"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
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
          <div className="mt-4 flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                className="mr-2"
              />
              Shuffle Questions
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showCorrectAnswers}
                onChange={(e) => setFormData({ ...formData, showCorrectAnswers: e.target.checked })}
                className="mr-2"
              />
              Show Correct Answers
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Add Question</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Type</label>
              <select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as 'mcq' | 'subjective' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="subjective">Subjective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <textarea
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                required
              />
            </div>
            {currentQuestion.type === 'mcq' && (
              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="font-medium">{opt.label}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[i].text = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
                <label className="block text-sm font-medium mb-1 mt-2">Correct Option</label>
                <select
                  value={currentQuestion.correctOption || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctOption: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select correct option</option>
                  {currentQuestion.options.map((_, i) => (
                    <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                  ))}
                </select>
              </div>
            )}
            {currentQuestion.type === 'subjective' && (
              <div>
                <label className="block text-sm font-medium mb-1">Model Answer (for reference)</label>
                <textarea
                  value={currentQuestion.modelAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, modelAnswer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Marks</label>
              <input
                type="number"
                value={currentQuestion.marks}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              Add Question
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Questions Added ({questions.length})</h2>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="p-3 bg-gray-50 rounded">
                  <span className="font-medium">Q{i + 1}.</span> {q.text} ({q.marks} marks)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition"
        >
          Create Quiz
        </button>
      </form>
    </div>
  );
};
