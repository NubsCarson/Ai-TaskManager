const express = require('express');
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = router; 