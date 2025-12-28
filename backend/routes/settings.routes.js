const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.controller'); 
const { protect } = require('../middleware/auth.middleware');// Assuming JWT token check


router.get('/', protect, controller.getSettings);
router.post('/', protect, controller.saveSettings);

module.exports = router;
