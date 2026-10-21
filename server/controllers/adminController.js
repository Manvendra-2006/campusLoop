const Complaint = require('../models/Complaint');
const { validationResult, body } = require('express-validator');
const complaintAIService = require('../services/complaintAIService');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to format complaint for response (exclude sensitive fields)
const formatComplaint = (complaint) => {
  const obj = complaint.toObject();
  delete obj.__v;
  return obj;
};

// Admin: List all complaints with filters, pagination, sorting
exports.listComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', status, priority, department, aiAnalysisStatus, search } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
    const sortOrder = ['createdAt', '-createdAt', 'priority', '-priority', 'status', '-status'].includes(sort)
      ? sort
      : '-createdAt';
    const filter = {};
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ message: 'Search must be a text value' });
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;
    if (aiAnalysisStatus) filter.aiAnalysisStatus = aiAnalysisStatus;
    if (search?.trim()) {
      const regex = new RegExp(escapeRegExp(search.trim()), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }
    const complaints = await Complaint.find(filter)
      .populate('createdBy', 'name email studentId')
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(sortOrder);
    const total = await Complaint.countDocuments(filter);
    res.json({ total, page: pageNumber, limit: pageSize, complaints: complaints.map(formatComplaint) });
  } catch (err) {
    next(err);
  }
};

// Admin: Stats aggregation for dashboard
exports.getStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });
    const urgent = await Complaint.countDocuments({ priority: 'Urgent' });
    const awaitingAI = await Complaint.countDocuments({ aiAnalysisStatus: { $in: ['Pending', 'Processing', 'Failed'] } });
    // Aggregations for charts
    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byPriority = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const byDepartment = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const byMonth = await Complaint.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ total, pending, inProgress, resolved, rejected, urgent, awaitingAI, byStatus, byPriority, byDepartment, byMonth });
  } catch (err) {
    next(err);
  }
};

// Admin: Update status
exports.updateStatus = [
  body('status').isIn(['Pending', 'In Progress', 'Resolved', 'Rejected']).withMessage('Invalid status'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      const { status, note } = req.body;
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      const oldStatus = complaint.status;
      if (oldStatus !== status) {
        complaint.status = status;
        complaint.statusHistory.push({ oldStatus, newStatus: status, changedBy: req.user.id, note, changedAt: new Date() });
        await complaint.save();
      }
      res.json({ message: 'Status updated', complaint: formatComplaint(complaint) });
    } catch (err) {
      next(err);
    }
  },
];

// Admin: Update priority (manual)
exports.updatePriority = [
  body('priority').isIn(['Urgent', 'High', 'Medium', 'Low']).withMessage('Invalid priority'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      const { priority, reason } = req.body;
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      const oldPriority = complaint.priority;
      if (oldPriority !== priority) {
        complaint.priority = priority;
        complaint.prioritySource = 'Admin';
        complaint.priorityReason = reason || '';
        complaint.priorityHistory.push({ oldPriority, newPriority: priority, source: 'Admin', reason, changedBy: req.user.id, changedAt: new Date() });
        await complaint.save();
      }
      res.json({ message: 'Priority updated', complaint: formatComplaint(complaint) });
    } catch (err) {
      next(err);
    }
  },
];

// Admin: Update department
exports.updateDepartment = [
  body('department').notEmpty().withMessage('Department required'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      const { department } = req.body;
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      complaint.department = department;
      await complaint.save();
      res.json({ message: 'Department updated', complaint: formatComplaint(complaint) });
    } catch (err) {
      next(err);
    }
  },
];

// Admin: Add internal note
exports.addNote = [
  body('note').trim().notEmpty().withMessage('Note required'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      const { note } = req.body;
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
      complaint.adminNotes.push({ note, author: req.user.id });
      await complaint.save();
      res.json({ message: 'Note added', complaint: formatComplaint(complaint) });
    } catch (err) {
      next(err);
    }
  },
];

// Admin: Trigger AI analysis (or retry)
exports.triggerAIAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.aiAnalysisStatus === 'Processing') {
      return res.status(409).json({ message: 'Analysis already in progress' });
    }
    // Set to processing
    complaint.aiAnalysisStatus = 'Processing';
    await complaint.save();
    // Call external service (non‑blocking) – we await but catch errors
    const result = await complaintAIService.analyzeComplaint(complaint);
    if (result.success) {
      // Validate returned priority if present
      const { priority } = result.data;
      if (priority && !['Urgent', 'High', 'Medium', 'Low'].includes(priority)) {
        throw new Error('Invalid priority from AI');
      }
      complaint.aiAnalysis = result.data;
      complaint.aiAnalysisStatus = 'Completed';
      // Apply AI-provided fields if present
      if (result.data.priority) {
        const oldPriority = complaint.priority || null;
        complaint.priority = result.data.priority;
        complaint.prioritySource = 'AI';
        complaint.priorityReason = result.data.priorityReason || '';
        complaint.priorityHistory.push({ oldPriority, newPriority: result.data.priority, source: 'AI', reason: result.data.priorityReason, changedBy: null, changedAt: new Date() });
      }
      if (result.data.department) complaint.department = result.data.department;
      if (result.data.category) complaint.category = result.data.category;
    } else {
      complaint.aiAnalysisStatus = 'Failed';
      complaint.aiAnalysis = { error: result.error };
    }
    await complaint.save();
    res.status(result.success ? 200 : 502).json({
      message: result.success ? 'AI analysis completed' : result.error || 'AI analysis failed',
      complaint: formatComplaint(complaint),
    });
  } catch (err) {
    // Ensure status is marked failed on unexpected error
    try {
      const complaint = await Complaint.findById(req.params.id);
      if (complaint) {
        complaint.aiAnalysisStatus = 'Failed';
        complaint.aiAnalysis = { error: err.message };
        await complaint.save();
      }
    } catch (saveError) {
      return next(saveError);
    }
    next(err);
  }
};
