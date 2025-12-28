const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: { connected: mongoose.connection.readyState === 1 }
  });
});

module.exports = router; 