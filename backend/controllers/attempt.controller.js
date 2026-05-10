const Attempt = require('../models/attempt.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Class = require('../models/class.model');
const Enrollment = require('../models/enrollment.model');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Quiz not found or not published' });
    }

    // Enrollment check
    const enrolled = await Enrollment.findOne({
      classId: quiz.classId,
      studentId: req.user._id,
    });
    if (!enrolled) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not enrolled in this class' });
    }

    const now = new Date();
    if (now < new Date(quiz.scheduledAt)) {
      return res.status(400).json({ success: false, message: 'Quiz has not opened yet' });
    }
    if (now > new Date(quiz.closesAt)) {
      return res.status(400).json({ success: false, message: 'Quiz is closed' });
    }

    const existingAttempt = await Attempt.findOne({ quizId, studentId: req.user._id });
    if (existingAttempt) {
      return res.status(400).json({ success: false, message: 'Already attempted this quiz' });
    }

    let questions = await Question.find({ quizId }).lean();
    if (quiz.shuffleQuestions) questions = shuffle(questions);

    let maxScore = 0;
    for (const q of questions) maxScore += q.marks;

    const attempt = new Attempt({
      quizId,
      studentId: req.user._id,
      answers: questions.map((q) => ({
        questionId: q._id,
        selectedOption: null,
        textAnswer: '',
        marksAwarded: 0,
      })),
      maxScore,
    });

    await attempt.save();

    // Strip correctOption / modelAnswer before sending to student
    for (const q of questions) {
      delete q.correctOption;
      delete q.modelAnswer;
    }

    res.status(201).json({
      success: true,
      message: 'Attempt started',
      data: { attempt, questions, timeLimit: quiz.timeLimit },
    });
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

    for (const answer of answers || []) {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      if (!question) continue;

      const attemptAnswer = attempt.answers.find(
        (a) => a.questionId.toString() === answer.questionId.toString()
      );
      if (!attemptAnswer) continue;

      attemptAnswer.selectedOption =
        answer.selectedOption !== undefined ? answer.selectedOption : null;
      attemptAnswer.textAnswer = answer.textAnswer || '';

      if (question.type === 'mcq') {
        if (
          attemptAnswer.selectedOption !== null &&
          attemptAnswer.selectedOption === question.correctOption
        ) {
          attemptAnswer.marksAwarded = question.marks;
          totalScore += question.marks;
        } else {
          attemptAnswer.marksAwarded = 0;
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

    if (req.user.role === 'student') {
      if (attempt.studentId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else if (req.user.role === 'teacher') {
      const classData = await Class.findById(attempt.quizId.classId);
      if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
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

    if (!Array.isArray(grading)) {
      return res.status(400).json({ success: false, message: 'grading must be an array' });
    }

    const attempt = await Attempt.findById(id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const classData = await Class.findById(quiz.classId);
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const questions = await Question.find({ quizId: attempt.quizId }).lean();

    let totalScore = 0;
    for (const answer of attempt.answers) {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      if (!question) continue;

      if (question.type === 'mcq') {
        // Auto-graded — keep as set on submit
        totalScore += answer.marksAwarded || 0;
      } else {
        const provided = grading.find(
          (g) => g.questionId.toString() === answer.questionId.toString()
        );
        if (provided) {
          const raw = Number(provided.marksAwarded);
          const safe = Number.isFinite(raw)
            ? Math.max(0, Math.min(question.marks, Math.floor(raw)))
            : 0;
          answer.marksAwarded = safe;
        }
        totalScore += answer.marksAwarded || 0;
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

const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.user._id })
      .populate({
        path: 'quizId',
        select: 'title classId timeLimit scheduledAt closesAt',
        populate: { path: 'classId', select: 'name subject' },
      })
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const summary = attempts.map((a) => ({
      _id: a._id,
      quizId: a.quizId?._id,
      quizTitle: a.quizId?.title || '—',
      className: a.quizId?.classId?.name || '—',
      classSubject: a.quizId?.classId?.subject || '',
      totalScore: a.totalScore,
      maxScore: a.maxScore,
      percentage: a.maxScore ? Math.round((a.totalScore / a.maxScore) * 100) : 0,
      isGraded: a.isGraded,
      submittedAt: a.submittedAt,
    }));

    res.json({ success: true, data: { attempts: summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getAttemptById,
  gradeAttempt,
  getMyAttempts,
};
