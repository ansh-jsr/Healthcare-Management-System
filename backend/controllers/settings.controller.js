const Settings = require('../models/settings.model');

// Get settings for a user
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user.id });
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

// Save/update settings
exports.saveSettings = async (req, res) => {
  try {
    const existing = await Settings.findOne({ userId: req.user.id });
    if (existing) {
      await Settings.updateOne({ userId: req.user.id }, req.body);
    } else {
      await Settings.create({ ...req.body, userId: req.user.id });
    }
    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
};
