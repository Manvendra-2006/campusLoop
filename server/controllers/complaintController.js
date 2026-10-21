const Complaint = require('../models/Complaint');
const { validationResult, body } = require('express-validator');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to format complaint for response (remove internal fields)
const formatComplaint = (complaint) => {
  const obj = complaint.toObject();
  delete obj.__v;
  delete obj.adminNotes;
  return obj;
};

// @route   POST /api/complaints
// @desc    Create a new complaint (student)
exports.createComplaint = [
  // Validation chain
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.building').trim().notEmpty().withMessage('Building is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, location, category, suggestedDepartment } = req.body;
      const attachment = req.file
        ? [{ filename: req.file.filename, url: `/uploads/${req.file.filename}`, mimetype: req.file.mimetype, size: req.file.size }]
        : [];

      const complaint = new Complaint({
        title,
        description,
        category,
        createdBy: req.user.id,
        location: {
          building: location.building,
          room: location.room,
        },
        attachments: attachment,
        // Initial fields
        status: 'Pending',
        aiAnalysisStatus: 'Pending',
      });

      // Optionally store suggested department (admin may override later)
      if (suggestedDepartment) complaint.department = suggestedDepartment;

      await complaint.save();
      res.status(201).json({ message: 'Complaint submitted', complaint: formatComplaint(complaint) });
    } catch (err) {
      next(err);
    }
  },
];

// @route   GET /api/complaints/my
// @desc    Get complaints created by the logged‑in student
exports.getMyComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, aiAnalysisStatus, search } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
    const filter = { createdBy: req.user.id };
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ message: 'Search must be a text value' });
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (aiAnalysisStatus) filter.aiAnalysisStatus = aiAnalysisStatus;
    if (search?.trim()) {
      const regex = new RegExp(escapeRegExp(search.trim()), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }
    const complaints = await Complaint.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort('-createdAt');
    const total = await Complaint.countDocuments(filter);
    res.json({ total, page: pageNumber, limit: pageSize, complaints: complaints.map(formatComplaint) });
  } catch (err) {
    next(err);
  }
};

exports.getMyComplaintStats = async (req, res, next) => {
  try {
    const filter = { createdBy: req.user.id };
    const [total, pending, inProgress, resolved, rejected, recentComplaints] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Pending' }),
      Complaint.countDocuments({ ...filter, status: 'In Progress' }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, status: 'Rejected' }),
      Complaint.find(filter).sort('-createdAt').limit(5),
    ]);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      recentComplaints: recentComplaints.map(formatComplaint),
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/complaints/:id
// @desc    Retrieve a single complaint (student can only view own)
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email studentId')
      .populate('adminNotes.author', 'name');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    // Enforce ownership for students
    if (req.user.role === 'student' && complaint.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: cannot access other users\' complaints' });
    }
    res.json({ complaint: formatComplaint(complaint) });
  } catch (err) {
    next(err);
  }
};
