const Shop = require('../model/shop.model');
const MedicalStoreOwner = require('../model/medicalStoreOwner.model');

// Get Shop Details
const getShopDetails = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;

        const shop = await Shop.findOne({ owner: ownerId })
            .populate('owner', 'ownerName email shopDetails');

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shop details retrieved successfully',
            shop
        });

    } catch (error) {
        console.error('Get shop details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Shop Services
const updateShopServices = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { services } = req.body;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const updatedShop = await Shop.findByIdAndUpdate(
            shop._id,
            { services },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Shop services updated successfully',
            shop: updatedShop
        });

    } catch (error) {
        console.error('Update shop services error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add Announcement
const addAnnouncement = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { title, message, type, endDate } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const announcement = {
            title,
            message,
            type: type || 'info',
            endDate: endDate ? new Date(endDate) : null
        };

        shop.announcements.push(announcement);
        await shop.save();

        res.status(201).json({
            success: true,
            message: 'Announcement added successfully',
            announcement: shop.announcements[shop.announcements.length - 1]
        });

    } catch (error) {
        console.error('Add announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Active Announcements
const getActiveAnnouncements = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const currentDate = new Date();
        const activeAnnouncements = shop.announcements.filter(announcement => 
            announcement.isActive && 
            (!announcement.endDate || announcement.endDate > currentDate)
        );

        res.status(200).json({
            success: true,
            message: 'Active announcements retrieved successfully',
            announcements: activeAnnouncements
        });

    } catch (error) {
        console.error('Get active announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Announcement Status
const updateAnnouncementStatus = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { announcementId } = req.params;
        const { isActive } = req.body;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const announcement = shop.announcements.id(announcementId);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        announcement.isActive = isActive;
        await shop.save();

        res.status(200).json({
            success: true,
            message: 'Announcement status updated successfully',
            announcement
        });

    } catch (error) {
        console.error('Update announcement status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add Holiday
const addHoliday = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { date, reason, isRecurring } = req.body;

        if (!date || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Date and reason are required'
            });
        }

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const holiday = {
            date: new Date(date),
            reason,
            isRecurring: isRecurring || false
        };

        shop.holidays.push(holiday);
        await shop.save();

        res.status(201).json({
            success: true,
            message: 'Holiday added successfully',
            holiday: shop.holidays[shop.holidays.length - 1]
        });

    } catch (error) {
        console.error('Add holiday error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Shop Statistics
const getShopStatistics = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const statistics = {
            metrics: shop.metrics,
            inventory: shop.inventory,
            ratings: shop.ratings,
            profileCompletion: shop.profileCompletion,
            operationalStatus: shop.operationalStatus,
            verification: shop.verification,
            totalCertifications: shop.certifications.length,
            activeAnnouncements: shop.announcements.filter(a => a.isActive).length,
            upcomingHolidays: shop.holidays.filter(h => h.date > new Date()).length
        };

        res.status(200).json({
            success: true,
            message: 'Shop statistics retrieved successfully',
            statistics
        });

    } catch (error) {
        console.error('Get shop statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add Certification
const addCertification = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { name, issuedBy, issuedDate, expiryDate, certificateNumber, documentUrl } = req.body;

        if (!name || !issuedBy || !issuedDate || !certificateNumber) {
            return res.status(400).json({
                success: false,
                message: 'Name, issuer, issued date, and certificate number are required'
            });
        }

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const certification = {
            name,
            issuedBy,
            issuedDate: new Date(issuedDate),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            certificateNumber,
            documentUrl
        };

        shop.certifications.push(certification);
        await shop.save();

        res.status(201).json({
            success: true,
            message: 'Certification added successfully',
            certification: shop.certifications[shop.certifications.length - 1]
        });

    } catch (error) {
        console.error('Add certification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Shop Tags
const updateShopTags = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                message: 'Tags must be an array'
            });
        }

        const shop = await Shop.findOneAndUpdate(
            { owner: ownerId },
            { tags },
            { new: true, runValidators: true }
        );

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shop tags updated successfully',
            shop
        });

    } catch (error) {
        console.error('Update shop tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getShopDetails,
    updateShopServices,
    addAnnouncement,
    getActiveAnnouncements,
    updateAnnouncementStatus,
    addHoliday,
    getShopStatistics,
    addCertification,
    updateShopTags
};
