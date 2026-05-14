const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: Number,
      default: null,
    },
    textAnswer: {
      type: String,
      default: '',
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
  }],
  totalScore: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  isGraded: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

attemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
