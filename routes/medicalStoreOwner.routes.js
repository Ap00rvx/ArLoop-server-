const express = require('express');
const router = express.Router();
const {
    registerStoreOwner,
    loginStoreOwner,
    getOwnerProfile,
    updateOwnerProfile,
    updateShopStatus,
    getNearbyStores,
    getAllStoreOwners,
    updateAccountStatus
} = require('../controller/medicalStoreOwner.controller');
const { authenticateStoreOwner, authenticateAdmin } = require('../middleware/storeOwnerAuth.middleware');

// Public routes (no authentication required)
router.post('/register', registerStoreOwner);
router.post('/login', loginStoreOwner);
router.get('/nearby', getNearbyStores);

// Protected routes (store owner authentication required)
router.get('/profile', authenticateStoreOwner, getOwnerProfile);
router.put('/profile', authenticateStoreOwner, updateOwnerProfile);
router.put('/shop/status', authenticateStoreOwner, updateShopStatus);

// Admin routes (admin authentication required)
router.get('/all', authenticateAdmin, getAllStoreOwners);
router.put('/:ownerId/status', authenticateAdmin, updateAccountStatus);

module.exports = router;
