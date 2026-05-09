const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Attempt = require('../models/attempt.model');
const Class = require('../models/class.model');

const createQuiz = async (req, res) => {
  try {
    const { classId, title, instructions, timeLimit, scheduledAt, closesAt, shuffleQuestions, showCorrectAnswers, questions } = req.body;

    const classData = await Class.findById(classId);
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const quiz = new Quiz({
      classId,
      title,
      instructions,
      timeLimit,
      scheduledAt,
      closesAt,
      shuffleQuestions,
      showCorrectAnswers,
      status: 'draft',
    });

    await quiz.save();

    for (const q of questions) {
      const question = new Question({
        quizId: quiz._id,
        type: q.type,
        text: q.text,
        options: q.options || [],
        correctOption: q.correctOption,
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

    const questions = await Question.find({ quizId: id }).lean();

    if (req.user.role === 'student' && quiz.status === 'published') {
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
    const { title, instructions, timeLimit, scheduledAt, closesAt, shuffleQuestions, showCorrectAnswers, questions } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Can only edit draft quizzes' });
    }

    const classData = await Class.findById(quiz.classId);
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    quiz.title = title || quiz.title;
    quiz.instructions = instructions || quiz.instructions;
    quiz.timeLimit = timeLimit || quiz.timeLimit;
    quiz.scheduledAt = scheduledAt || quiz.scheduledAt;
    quiz.closesAt = closesAt || quiz.closesAt;
    quiz.shuffleQuestions = shuffleQuestions !== undefined ? shuffleQuestions : quiz.shuffleQuestions;
    quiz.showCorrectAnswers = showCorrectAnswers !== undefined ? showCorrectAnswers : quiz.showCorrectAnswers;

    await quiz.save();

    if (questions) {
      await Question.deleteMany({ quizId: id });
      for (const q of questions) {
        const question = new Question({
          quizId: id,
          type: q.type,
          text: q.text,
          options: q.options || [],
          correctOption: q.correctOption,
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
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
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

    const quizzes = await Quiz.find({ classId }).sort({ scheduledAt: -1 }).lean();

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
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
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

module.exports = {
  createQuiz,
  getQuizById,
  updateQuiz,
  publishQuiz,
  getQuizzesByClass,
  getQuizResults,
};
