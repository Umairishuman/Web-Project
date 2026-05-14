const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Attempt = require('../models/attempt.model');
const Class = require('../models/class.model');
const Enrollment = require('../models/enrollment.model');

const isTeacherOf = (classData, userId) =>
  classData && classData.teacherId.toString() === userId.toString();

const isEnrolled = async (classId, studentId) => {
  const e = await Enrollment.findOne({ classId, studentId });
  return !!e;
};

const canAccessClass = async (classData, user) => {
  if (!classData) return false;
  if (user.role === 'admin') return true;
  if (isTeacherOf(classData, user._id)) return true;
  if (user.role === 'student') return isEnrolled(classData._id, user._id);
  return false;
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const createQuiz = async (req, res) => {
  try {
    const {
      classId,
      title,
      instructions,
      timeLimit,
      scheduledAt,
      closesAt,
      shuffleQuestions,
      showCorrectAnswers,
      questions,
      status,
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one question is required' });
    }

    if (new Date(closesAt) <= new Date(scheduledAt)) {
      return res
        .status(400)
        .json({ success: false, message: 'closesAt must be after scheduledAt' });
    }

    const classData = await Class.findById(classId);
    if (!classData || !isTeacherOf(classData, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate questions
    for (const q of questions) {
      if (!q.text || !q.text.trim()) {
        return res.status(400).json({ success: false, message: 'Each question needs text' });
      }
      if (!['mcq', 'subjective'].includes(q.type)) {
        return res.status(400).json({ success: false, message: 'Invalid question type' });
      }
      if (q.type === 'mcq') {
        if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
          return res
            .status(400)
            .json({ success: false, message: 'MCQ must have between 2 and 6 options' });
        }
        if (
          q.correctOption === null ||
          q.correctOption === undefined ||
          q.correctOption < 0 ||
          q.correctOption >= q.options.length
        ) {
          return res
            .status(400)
            .json({ success: false, message: 'MCQ correctOption is invalid' });
        }
      }
      if (!Number.isInteger(q.marks) || q.marks < 1) {
        return res.status(400).json({ success: false, message: 'Marks must be at least 1' });
      }
    }

    const quiz = new Quiz({
      classId,
      title,
      instructions: instructions || '',
      timeLimit,
      scheduledAt,
      closesAt,
      shuffleQuestions: !!shuffleQuestions,
      showCorrectAnswers: !!showCorrectAnswers,
      status: status === 'published' ? 'published' : 'draft',
    });

    await quiz.save();

    for (const q of questions) {
      const question = new Question({
        quizId: quiz._id,
        type: q.type,
        text: q.text,
        options: q.options || [],
        correctOption: q.type === 'mcq' ? q.correctOption : null,
        marks: q.marks,
        modelAnswer: q.modelAnswer || '',
      });
      await question.save();
    }

    res.status(201).json({ success: true, message: 'Quiz created', data: { quiz } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).lean();
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const classData = await Class.findById(quiz.classId);
    if (!(await canAccessClass(classData, req.user))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Students cannot view drafts
    if (req.user.role === 'student' && quiz.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let questions = await Question.find({ quizId: id }).lean();

    if (req.user.role === 'student') {
      if (quiz.shuffleQuestions) questions = shuffle(questions);
      for (const q of questions) {
        delete q.correctOption;
        delete q.modelAnswer;
      }
    }

    res.json({ success: true, data: { quiz, questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      instructions,
      timeLimit,
      scheduledAt,
      closesAt,
      shuffleQuestions,
      showCorrectAnswers,
      questions,
    } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Can only edit draft quizzes' });
    }

    const classData = await Class.findById(quiz.classId);
    if (!isTeacherOf(classData, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (title !== undefined) quiz.title = title;
    if (instructions !== undefined) quiz.instructions = instructions;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (scheduledAt !== undefined) quiz.scheduledAt = scheduledAt;
    if (closesAt !== undefined) quiz.closesAt = closesAt;
    if (shuffleQuestions !== undefined) quiz.shuffleQuestions = !!shuffleQuestions;
    if (showCorrectAnswers !== undefined) quiz.showCorrectAnswers = !!showCorrectAnswers;

    if (quiz.closesAt <= quiz.scheduledAt) {
      return res
        .status(400)
        .json({ success: false, message: 'closesAt must be after scheduledAt' });
    }

    await quiz.save();

    if (Array.isArray(questions) && questions.length > 0) {
      await Question.deleteMany({ quizId: id });
      for (const q of questions) {
        const question = new Question({
          quizId: id,
          type: q.type,
          text: q.text,
          options: q.options || [],
          correctOption: q.type === 'mcq' ? q.correctOption : null,
          marks: q.marks,
          modelAnswer: q.modelAnswer || '',
        });
        await question.save();
      }
    }

    res.json({ success: true, message: 'Quiz updated', data: { quiz } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const classData = await Class.findById(quiz.classId);
    if (!isTeacherOf(classData, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    quiz.status = 'published';
    await quiz.save();

    res.json({ success: true, message: 'Quiz published', data: { quiz } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizzesByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (!(await canAccessClass(classData, req.user))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let quizzes = await Quiz.find({ classId }).sort({ scheduledAt: -1 }).lean();
    if (req.user.role === 'student') {
      quizzes = quizzes.filter((q) => q.status === 'published');
    }

    res.json({ success: true, data: { quizzes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const classData = await Class.findById(quiz.classId);
    if (!isTeacherOf(classData, req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempts = await Attempt.find({ quizId: id })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })
      .lean();

    const questions = await Question.find({ quizId: id }).lean();

    res.json({ success: true, data: { attempts, questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const classData = await Class.findById(quiz.classId);
    if (!isTeacherOf(classData, req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempts = await Attempt.find({ quizId: id, submittedAt: { $ne: null } }).lean();
    const enrolledCount = await Enrollment.countDocuments({ classId: quiz.classId });

    const total = attempts.length;
    const distribution = [
      { range: '0–40', students: 0 },
      { range: '40–60', students: 0 },
      { range: '60–80', students: 0 },
      { range: '80–100', students: 0 },
    ];
    let avg = 0;

    if (total > 0) {
      const pcts = attempts.map((a) => (a.totalScore / (a.maxScore || 1)) * 100);
      avg = Math.round(pcts.reduce((s, p) => s + p, 0) / total);
      pcts.forEach((p) => {
        if (p < 40) distribution[0].students++;
        else if (p < 60) distribution[1].students++;
        else if (p < 80) distribution[2].students++;
        else distribution[3].students++;
      });
    }

    const participation =
      enrolledCount > 0 ? Math.round((total / enrolledCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        attempts: total,
        enrolled: enrolledCount,
        average: avg,
        participation,
        distribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  updateQuiz,
  publishQuiz,
  getQuizzesByClass,
  getQuizResults,
  getQuizAnalytics,
};
