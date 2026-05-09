const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
  },
  instructions: {
    type: String,
    default: '',
  },
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: 1,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  closesAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  shuffleQuestions: {
    type: Boolean,
    default: false,
  },
  showCorrectAnswers: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);
