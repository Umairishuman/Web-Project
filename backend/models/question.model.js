const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'subjective'],
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: [{
    label: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  correctOption: {
    type: Number,
    default: null,
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: 1,
  },
  modelAnswer: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Question', questionSchema);
