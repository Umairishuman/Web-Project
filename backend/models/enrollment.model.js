const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

enrollmentSchema.index({ classId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
