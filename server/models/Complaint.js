const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },
});

const priorityHistorySchema = new mongoose.Schema({
  oldPriority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low', null] },
  newPriority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low', null] },
  source: { type: String, enum: ['AI', 'Admin', 'RuleBased'] },
  reason: { type: String },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new mongoose.Schema({
  oldStatus: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', null] },
  newStatus: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', null] },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
  changedAt: { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      building: { type: String, required: true },
      room: { type: String },
    },
    attachments: [attachmentSchema],
    category: { type: String },
    department: { type: String },
    priority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low'] },
    prioritySource: { type: String, enum: ['AI', 'Admin', 'RuleBased'] },
    priorityReason: { type: String },
    priorityHistory: [priorityHistorySchema],
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    aiAnalysisStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed'],
      default: 'Pending',
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
    },
    statusHistory: [statusHistorySchema],
    adminNotes: [{
      note: { type: String },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Indexes for common queries
complaintSchema.index({ createdAt: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
