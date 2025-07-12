const express = require('express');
const router = express.Router();
const {
    getShopDetails,
    updateShopServices,
    addAnnouncement,
    getActiveAnnouncements,
    updateAnnouncementStatus,
    addHoliday,
    getShopStatistics,
    addCertification,
    updateShopTags
} = require('../controller/shop.controller');
const { authenticateStoreOwner } = require('../middleware/storeOwnerAuth.middleware');

// All shop routes require store owner authentication
router.get('/details', authenticateStoreOwner, getShopDetails);
router.put('/services', authenticateStoreOwner, updateShopServices);
router.get('/statistics', authenticateStoreOwner, getShopStatistics);
router.put('/tags', authenticateStoreOwner, updateShopTags);

// Announcement routes
router.post('/announcements', authenticateStoreOwner, addAnnouncement);
router.get('/announcements/active', authenticateStoreOwner, getActiveAnnouncements);
router.put('/announcements/:announcementId/status', authenticateStoreOwner, updateAnnouncementStatus);

// Holiday routes
router.post('/holidays', authenticateStoreOwner, addHoliday);

// Certification routes
router.post('/certifications', authenticateStoreOwner, addCertification);

module.exports = router;
