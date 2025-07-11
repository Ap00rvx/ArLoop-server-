const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    getAllUsers
} = require('../controller/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.put('/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteUserAccount);

// Admin routes (you can add admin middleware later)
router.get('/all', authenticateToken, getAllUsers);

module.exports = router;
