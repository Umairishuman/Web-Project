import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Question {
  _id: string;
  type: 'mcq' | 'subjective';
  text: string;
  marks: number;
  correctOption: number;
}

interface Attempt {
  _id: string;
  studentId: { name: string; email: string };
  answers: { questionId: string; selectedOption: number | null; textAnswer: string; marksAwarded: number }[];
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
  const [grading, setGrading] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/quizzes/${id}/results`);
      if (response.data.success) {
        setAttempts(response.data.data.attempts);
        setQuestions(response.data.data.questions);
      }
    } catch (error) {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (attemptId: string) => {
    try {
      const gradingData = questions.map(q => ({
        questionId: q._id,
        marksAwarded: grading[q._id] || 0,
      }));
      const response = await api.patch(`/attempts/${attemptId}/grade`, { grading: gradingData });
      if (response.data.success) {
        showToast('Attempt graded', 'success');
        fetchResults();
      }
    } catch (error) {
      showToast('Failed to grade attempt', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-darknavy mb-6">Quiz Results</h1>

      <div className="space-y-6">
        {attempts.map((attempt) => (
          <div key={attempt._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">{attempt.studentId.name}</h3>
                <p className="text-sm text-gray-500">{attempt.studentId.email}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {attempt.totalScore} / {attempt.maxScore}
                </p>
                <span className={`text-sm ${attempt.isGraded ? 'text-green-500' : 'text-yellow-500'}`}>
                  {attempt.isGraded ? 'Graded' : 'Pending Grading'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Answers</h4>
              {questions.map((question, qIndex) => {
                const answer = attempt.answers.find(a => a.questionId === question._id);
                return (
                  <div key={question._id} className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="font-medium">Q{qIndex + 1}. {question.text} ({question.marks} marks)</p>
                    {question.type === 'mcq' ? (
                      <p className="text-sm mt-1">
                        Selected: Option {answer?.selectedOption !== null ? String.fromCharCode(65 + answer.selectedOption) : 'Not answered'}
                        {answer?.selectedOption === question.correctOption && ' ✓'}
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm mt-1">Answer: {answer?.textAnswer || 'Not answered'}</p>
                        {!attempt.isGraded && (
                          <div className="mt-2">
                            <label className="text-sm">Marks Awarded:</label>
                            <input
                              type="number"
                              min="0"
                              max={question.marks}
                              value={grading[question._id] || answer?.marksAwarded || 0}
                              onChange={(e) => setGrading({ ...grading, [question._id]: parseInt(e.target.value) })}
                              className="w-20 px-2 py-1 border rounded ml-2"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!attempt.isGraded && (
              <button
                onClick={() => handleGrade(attempt._id)}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Submit Grades
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
