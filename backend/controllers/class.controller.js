const Class = require('../models/class.model');
const Enrollment = require('../models/enrollment.model');
const Announcement = require('../models/announcement.model');
const Comment = require('../models/comment.model');
const generateJoinCode = require('../utils/generateJoinCode');

const createClass = async (req, res) => {
  try {
    const { name, subject, description } = req.body;
    const joinCode = generateJoinCode();

    const newClass = new Class({
      name,
      subject,
      description,
      joinCode,
      teacherId: req.user._id,
    });

    await newClass.save();

    res.status(201).json({ success: true, message: 'Class created', data: { class: newClass } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { classes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findById(id)
      .populate('teacherId', 'name email')
      .lean();

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const enrollments = await Enrollment.find({ classId: id })
      .populate('studentId', 'name email')
      .lean();

    const announcements = await Announcement.find({ classId: id })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    for (const ann of announcements) {
      ann.comments = await Comment.find({ announcementId: ann._id })
        .populate('authorId', 'name')
        .sort({ createdAt: 1 })
        .lean();
    }

    res.json({
      success: true,
      data: { class: classData, students: enrollments, announcements },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const joinClass = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const classData = await Class.findOne({ joinCode });

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Invalid join code' });
    }

    const existingEnrollment = await Enrollment.findOne({
      classId: classData._id,
      studentId: req.user._id,
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
    }

    const enrollment = new Enrollment({
      classId: classData._id,
      studentId: req.user._id,
    });

    await enrollment.save();

    res.json({ success: true, message: 'Successfully joined class', data: { class: classData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentClasses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate('classId')
      .populate('classId.teacherId', 'name')
      .lean();

    const classes = enrollments.map(e => e.classId);

    res.json({ success: true, data: { classes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classData = await Class.findById(id);
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Enrollment.deleteOne({ classId: id, studentId });

    res.json({ success: true, message: 'Student removed from class' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isAnonymous } = req.body;

    const classData = await Class.findById(id);
    if (!classData || classData.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const announcement = new Announcement({
      classId: id,
      authorId: req.user._id,
      content,
      isAnonymous,
    });

    await announcement.save();

    res.status(201).json({ success: true, message: 'Announcement created', data: { announcement } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { id, annId } = req.params;
    const { content, isAnonymous } = req.body;

    const announcement = await Announcement.findById(annId);
    if (!announcement || announcement.classId.toString() !== id) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const comment = new Comment({
      announcementId: annId,
      authorId: req.user._id,
      content,
      isAnonymous,
    });

    await comment.save();

    res.status(201).json({ success: true, message: 'Comment added', data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  getClassById,
  joinClass,
  getStudentClasses,
  removeStudent,
  createAnnouncement,
  createComment,
};
