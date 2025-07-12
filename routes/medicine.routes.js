const express = require('express');
const router = express.Router();
const {
    addMedicine,
    getOwnerMedicines,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    getMedicineDetails,
    updateStock,
    getLowStockMedicines,
    getExpiredMedicines
} = require('../controller/medicine.controller');
const { authenticateStoreOwner, optionalStoreOwnerAuth } = require('../middleware/storeOwnerAuth.middleware');

// Public routes (no authentication required)
router.get('/search', optionalStoreOwnerAuth, searchMedicines);
router.get('/:medicineId', getMedicineDetails);

// Protected routes (store owner authentication required)
router.post('/add', authenticateStoreOwner, addMedicine);
router.get('/owner/all', authenticateStoreOwner, getOwnerMedicines);
router.put('/:medicineId', authenticateStoreOwner, updateMedicine);
router.delete('/:medicineId', authenticateStoreOwner, deleteMedicine);

// Stock management routes
router.put('/:medicineId/stock', authenticateStoreOwner, updateStock);
router.get('/owner/low-stock', authenticateStoreOwner, getLowStockMedicines);
router.get('/owner/expired', authenticateStoreOwner, getExpiredMedicines);

module.exports = router;
