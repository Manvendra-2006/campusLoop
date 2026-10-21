const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// List and stats
router.get('/complaints', adminController.listComplaints);
router.get('/complaints/stats', adminController.getStats);

// Complaint mutations
router.patch('/complaints/:id/status', adminController.updateStatus);
router.patch('/complaints/:id/priority', adminController.updatePriority);
router.patch('/complaints/:id/department', adminController.updateDepartment);
router.post('/complaints/:id/notes', adminController.addNote);
router.post('/complaints/:id/analyze', adminController.triggerAIAnalysis);
router.post('/complaints/:id/retry-analysis', adminController.triggerAIAnalysis); // reuse same handler

module.exports = router;
