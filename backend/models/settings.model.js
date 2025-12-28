const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Notification
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },

  // Privacy
  showProfileToOthers: { type: Boolean, default: true },
  shareActivityData: { type: Boolean, default: false },

  // Security
  twoFactorAuth: { type: Boolean, default: false },

  // Display
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, default: 'en' },

  // Data
  autoBackup: { type: Boolean, default: true },
  dataRetention: { type: Number, default: 90 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
