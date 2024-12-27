const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Input validation middleware
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),
  body('category')
    .optional()
    .isIn(['WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'])
    .withMessage('Invalid category'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('AssignedTo must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const commentValidation = [
  body('text').trim().notEmpty().withMessage('Comment text is required'),
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/', taskValidation, taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/:id', taskController.getTask);
router.patch('/:id', taskValidation, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/comments', commentValidation, taskController.addComment);

module.exports = router; 