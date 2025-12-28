// controllers/support.controller.js
const SupportTicket = require('../models/support.model');

exports.submitTicket = async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const ticket = new SupportTicket({ name, email, subject, category, message });
    await ticket.save();

    res.status(201).json({ success: true, message: 'Support ticket submitted successfully', ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit support ticket', error: err.message });
  }
};
