const express = require('express');
const router = express.Router();
const { register, login, getMe, listUsers } = require('../controllers/authController');
const { protect, requireRole } = require('../middlewares/auth');

// Públicas
router.post('/register', register);
router.post('/login', login);

// Protegidas
router.get('/me', protect, getMe);
router.get('/users', protect, requireRole('admin'), listUsers);

module.exports = router;
