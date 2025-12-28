const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getCurrentUser);
router.put('/users/:id', protect, authController.updateUser);
router.post('/wallet-auth', authController.walletAuth);

// Change password
router.post('/change-password', protect, authController.changePassword);

module.exports = router; 