// controllers/notification.controller.js
const Notification = require('../models/notification');
const User = require('../models/user.model');
exports.sendNotification = async (req, res) => {
  const { message, receiverEmail, sendToAll } = req.body;
  const senderId = req.user ? req.user.id : req.body.senderId;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    if (sendToAll) {
      const patients = await User.find({ role: 'patient' });

      if (!patients.length) {
        return res.status(404).json({ error: 'No patients found to send notifications' });
      }

      const notifications = patients.map((patient) => ({
        senderId,
        receiverId: patient._id,
        message,
        sentToAll: true,
      }));

      await Notification.insertMany(notifications);
      return res.status(201).json({ message: 'Notification sent to all patients.' });

    } else {
      if (!receiverEmail) {
        return res.status(400).json({ error: 'receiverEmail is required when sendToAll is false' });
      }

      const receiver = await User.findOne({ email: receiverEmail, role: 'patient' });

      if (!receiver) {
        return res.status(404).json({ error: 'Patient with provided email not found' });
      }

      const notification = new Notification({
        senderId,
        receiverId: receiver._id,
        message,
        sentToAll: false,
      });

      await notification.save();
      return res.status(201).json({ message: 'Notification sent to the patient.' });
    }

  } catch (err) {
    console.error('Send Notification Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


exports.getUserNotifications = async (req, res) => {
  // For testing in Postman, you might need to modify this when auth middleware is not active
  const userId = req.user ? req.user.id : req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const notifications = await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


exports.markAllAsRead = async (req, res) => {
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized or missing user' });
  }

  try {
    await Notification.updateMany({ receiverId: userId, read: false }, { $set: { read: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark All As Read Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
