const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Doctor
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Patient (optional if sent to all)
  message: { type: String, required: true },
  sentToAll: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Notification', notificationSchema);
