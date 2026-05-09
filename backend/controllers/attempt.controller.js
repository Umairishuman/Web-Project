const Attempt = require('../models/attempt.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');

const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Quiz not found or not published' });
    }

    const now = new Date();
    if (now < new Date(quiz.scheduledAt) || now > new Date(quiz.closesAt)) {
      return res.status(400).json({ success: false, message: 'Quiz is not available' });
    }

    const existingAttempt = await Attempt.findOne({ quizId, studentId: req.user._id });
    if (existingAttempt) {
      return res.status(400).json({ success: false, message: 'Already attempted this quiz' });
    }

    const questions = await Question.find({ quizId }).lean();
    let maxScore = 0;
    for (const q of questions) {
      maxScore += q.marks;
    }

    const attempt = new Attempt({
      quizId,
      studentId: req.user._id,
      answers: questions.map(q => ({ questionId: q._id, selectedOption: null, textAnswer: '', marksAwarded: 0 })),
      maxScore,
    });

    await attempt.save();

    res.status(201).json({ success: true, message: 'Attempt started', data: { attempt, questions, timeLimit: quiz.timeLimit } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const attempt = await Attempt.findById(id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }

    const questions = await Question.find({ quizId: attempt.quizId }).lean();
    let totalScore = 0;
    let hasSubjective = false;

    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      if (!question) continue;

      const attemptAnswer = attempt.answers.find(a => a.questionId.toString() === answer.questionId.toString());
      if (!attemptAnswer) continue;

      attemptAnswer.selectedOption = answer.selectedOption;
      attemptAnswer.textAnswer = answer.textAnswer;

      if (question.type === 'mcq') {
        if (answer.selectedOption === question.correctOption) {
          attemptAnswer.marksAwarded = question.marks;
          totalScore += question.marks;
        }
      } else {
        hasSubjective = true;
      }
    }

    attempt.totalScore = totalScore;
    attempt.submittedAt = new Date();
    attempt.isGraded = !hasSubjective;

    await attempt.save();

    res.json({ success: true, message: 'Attempt submitted', data: { attempt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttemptById = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await Attempt.findById(id)
      .populate('quizId')
      .populate('studentId', 'name email')
      .lean();

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (req.user.role === 'student' && attempt.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const questions = await Question.find({ quizId: attempt.quizId._id }).lean();

    if (req.user.role === 'student' && !attempt.quizId.showCorrectAnswers) {
      for (const q of questions) {
        delete q.correctOption;
        delete q.modelAnswer;
      }
    }

    res.json({ success: true, data: { attempt, questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const gradeAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { grading } = req.body;

    const attempt = await Attempt.findById(id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const Class = require('../models/class.model');
    const classData = await Class.findById(quiz.classId);

    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let totalScore = 0;
    for (const g of grading) {
      const answer = attempt.answers.find(a => a.questionId.toString() === g.questionId.toString());
      if (answer) {
        answer.marksAwarded = g.marksAwarded;
        totalScore += g.marksAwarded;
      }
    }

    attempt.totalScore = totalScore;
    attempt.isGraded = true;
    await attempt.save();

    res.json({ success: true, message: 'Attempt graded', data: { attempt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startAttempt, submitAttempt, getAttemptById, gradeAttempt };
