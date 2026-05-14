const Class = require('../models/class.model');
const Enrollment = require('../models/enrollment.model');
const Announcement = require('../models/announcement.model');
const Comment = require('../models/comment.model');
const generateJoinCode = require('../utils/generateJoinCode');

const isTeacherOf = (classData, userId) =>
  classData && classData.teacherId.toString() === userId.toString();

const isEnrolled = async (classId, studentId) => {
  const e = await Enrollment.findOne({ classId, studentId });
  return !!e;
};

const ensureClassAccess = async (classData, user) => {
  if (!classData) return false;
  if (user.role === 'admin') return true;
  if (isTeacherOf(classData, user._id)) return true;
  if (user.role === 'student') return await isEnrolled(classData._id, user._id);
  return false;
};

const generateUniqueJoinCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = generateJoinCode();
    const exists = await Class.findOne({ joinCode: code });
    if (!exists) return code;
  }
  throw new Error('Could not generate a unique join code');
};

const createClass = async (req, res) => {
  try {
    const { name, subject, description } = req.body;
    const joinCode = await generateUniqueJoinCode();

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
    const classData = await Class.findById(id).populate('teacherId', 'name email').lean();

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (!(await ensureClassAccess(classData, req.user))) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not enrolled in this class' });
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

const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    if (!isTeacherOf(classData, req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const students = await Enrollment.find({ classId: id })
      .populate('studentId', 'name email isActive')
      .lean();
    res.json({ success: true, data: { students } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const joinClass = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const code = (joinCode || '').toString().trim().toUpperCase();
    const classData = await Class.findOne({ joinCode: code });

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Invalid join code' });
    }

    const existing = await Enrollment.findOne({
      classId: classData._id,
      studentId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
    }

    await new Enrollment({
      classId: classData._id,
      studentId: req.user._id,
    }).save();

    res.json({ success: true, message: 'Successfully joined class', data: { class: classData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentClasses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate({
        path: 'classId',
        populate: { path: 'teacherId', select: 'name email' },
      })
      .lean();

    const classes = enrollments.map((e) => e.classId).filter(Boolean);

    res.json({ success: true, data: { classes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classData = await Class.findById(id);
    if (!classData || !isTeacherOf(classData, req.user._id)) {
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
    if (!classData || !isTeacherOf(classData, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const announcement = new Announcement({
      classId: id,
      authorId: req.user._id,
      content,
      isAnonymous: !!isAnonymous,
    });

    await announcement.save();

    res
      .status(201)
      .json({ success: true, message: 'Announcement created', data: { announcement } });
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

    const classData = await Class.findById(id);
    if (!(await ensureClassAccess(classData, req.user))) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not enrolled in this class' });
    }

    const comment = new Comment({
      announcementId: annId,
      authorId: req.user._id,
      content,
      isAnonymous: !!isAnonymous,
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
  getClassStudents,
  joinClass,
  getStudentClasses,
  removeStudent,
  createAnnouncement,
  createComment,
};
