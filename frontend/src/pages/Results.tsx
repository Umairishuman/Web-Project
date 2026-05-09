import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Question {
  _id: string;
  type: 'mcq' | 'subjective';
  text: string;
  marks: number;
  correctOption?: number;
  modelAnswer?: string;
}

interface Attempt {
  _id: string;
  totalScore: number;
  maxScore: number;
  isGraded: boolean;
  submittedAt: string;
  answers: { questionId: string; selectedOption: number | null; textAnswer: string; marksAwarded: number }[];
}

export const Results = () => {
  const { attemptId } = useParams();
  const { showToast } = useToast();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const response = await api.get(`/attempts/${attemptId}`);
      if (response.data.success) {
        setAttempt(response.data.data.attempt);
        setQuestions(response.data.data.questions);
      }
    } catch (error) {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const percentage = attempt ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-darknavy mb-4">Quiz Results</h1>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Score: <span className="text-2xl font-bold text-primary">{attempt?.totalScore}</span> / {attempt?.maxScore}</p>
            <p className="text-gray-500 mt-1">{percentage}%</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${percentage >= 60 ? 'text-green-500' : 'text-red-500'}`}>
              {percentage >= 60 ? 'Pass' : 'Fail'}
            </p>
            <p className="text-sm text-gray-500">
              {attempt?.isGraded ? 'Graded' : 'Pending Grading'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = attempt?.answers.find(a => a.questionId === question._id);
          return (
            <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Q{index + 1}. {question.text}</h3>
                <span className="text-sm text-gray-500">{answer?.marksAwarded} / {question.marks} marks</span>
              </div>
              
              {question.type === 'mcq' ? (
                <div>
                  <p className="text-sm text-gray-600">
                    Your answer: {answer?.selectedOption !== null ? String.fromCharCode(65 + answer.selectedOption) : 'Not answered'}
                  </p>
                  {question.correctOption !== undefined && (
                    <p className="text-sm text-green-600">
                      Correct answer: {String.fromCharCode(65 + question.correctOption)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Your answer: {answer?.textAnswer || 'Not answered'}</p>
                  {question.modelAnswer && (
                    <p className="text-sm text-gray-500 mt-1">Model answer: {question.modelAnswer}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
