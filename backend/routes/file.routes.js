const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Upload file route - protected
router.post('/upload', protect, upload.single('file'), fileController.uploadFile);

// Get all files route - protected
router.get('/all', protect, fileController.getAllFiles);

module.exports = router;