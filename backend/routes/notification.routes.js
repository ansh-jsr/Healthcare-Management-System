const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken, requireDoctor } = require('../middleware/auth.middleware');

// Only authenticated users (doctors) can send notifications
router.post('/send', verifyToken, requireDoctor, notificationController.sendNotification);

// Any authenticated user can view their notifications
router.get('/my', verifyToken, notificationController.getUserNotifications);
router.put('/mark-all-read', verifyToken, notificationController.markAllAsRead);

module.exports = router;
