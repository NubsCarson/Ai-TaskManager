const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    default: 'TODO',
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  },
  dueDate: {
    type: Date,
  },
  category: {
    type: String,
    enum: ['WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'],
    default: 'OTHER',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  aiSuggestions: {
    suggestedPriority: String,
    suggestedCategory: String,
    suggestedDueDate: Date,
    confidence: Number,
  },
  completedAt: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ createdBy: 1 });

// Virtual field for time until due
taskSchema.virtual('timeUntilDue').get(function() {
  if (!this.dueDate) return null;
  return this.dueDate - new Date();
});

// Pre-save middleware to update completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'DONE' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 