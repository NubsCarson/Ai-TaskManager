const Task = require('../models/Task');
const { Configuration, OpenAIApi } = require('openai');
const { validationResult } = require('express-validator');

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Get AI suggestions for task
const getAISuggestions = async (taskTitle, taskDescription) => {
  try {
    const prompt = `Analyze this task and provide suggestions for priority level (LOW, MEDIUM, HIGH, URGENT), category (WORK, PERSONAL, SHOPPING, HEALTH, EDUCATION, OTHER), and estimated due date (in days from now). Format response as JSON.
Task title: ${taskTitle}
Task description: ${taskDescription}`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
      temperature: 0.5,
    });

    const suggestions = JSON.parse(response.data.choices[0].text.trim());
    return {
      suggestedPriority: suggestions.priority,
      suggestedCategory: suggestions.category,
      suggestedDueDate: new Date(Date.now() + suggestions.dueInDays * 24 * 60 * 60 * 1000),
      confidence: suggestions.confidence || 0.8,
    };
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return null;
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Get AI suggestions if enabled
    if (req.body.useAI) {
      const aiSuggestions = await getAISuggestions(req.body.title, req.body.description);
      if (aiSuggestions) {
        taskData.aiSuggestions = aiSuggestions;
        if (!req.body.priority) taskData.priority = aiSuggestions.suggestedPriority;
        if (!req.body.category) taskData.category = aiSuggestions.suggestedCategory;
        if (!req.body.dueDate) taskData.dueDate = aiSuggestions.suggestedDueDate;
      }
    }

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const match = { createdBy: req.user._id };
    const sort = {};

    // Filter conditions
    if (req.query.status) match.status = req.query.status;
    if (req.query.priority) match.priority = req.query.priority;
    if (req.query.category) match.category = req.query.category;
    if (req.query.isArchived) match.isArchived = req.query.isArchived === 'true';

    // Search
    if (req.query.search) {
      match.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const tasks = await Task.find(match)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('assignedTo', 'name email avatar');

    const total = await Task.countDocuments(match);

    res.json({
      status: 'success',
      data: {
        tasks,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title', 'description', 'status', 'priority',
      'dueDate', 'category', 'tags', 'assignedTo',
      'attachments', 'isArchived'
    ];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid updates'
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    updates.forEach(update => {
      task[update] = req.body[update];
    });

    await task.save();

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add comment to task
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    task.comments.push({
      text: req.body.text,
      author: req.user._id
    });

    await task.save();

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'DONE'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          completed: 1,
          overdue: 1,
          completion_rate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: stats[0] || {
          total: 0,
          completed: 0,
          overdue: 0,
          completion_rate: 0
        },
        byCategory: categoryStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 