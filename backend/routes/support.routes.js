// routes/support.routes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');

router.post('/submit', supportController.submitTicket);

module.exports = router;
