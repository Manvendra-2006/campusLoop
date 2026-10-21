const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { register, login, logout, getMe, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Update profile
router.put('/me', protect, updateProfile);
module.exports = router;
