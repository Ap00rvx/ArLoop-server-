const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const MedicalStoreOwner = require('../model/medicalStoreOwner.model');
const Shop = require('../model/shop.model');

// Generate JWT Token
const generateToken = (ownerId) => {
    return jwt.sign({ ownerId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register Medical Store Owner
const registerStoreOwner = async (req, res) => {
    try {
        const {
            ownerName,
            email,
            password,
            phone,
            alternatePhone,
            shopDetails,
            businessInfo
        } = req.body;

        // Validate required fields
        if (!ownerName || !email || !password || !phone || !shopDetails) {
            return res.status(400).json({
                success: false,
                message: 'Owner name, email, password, phone, and shop details are required'
            });
        }

        // Validate phone number
        if (phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits'
            });
        }

        // Check if owner already exists
        const existingOwner = await MedicalStoreOwner.findOne({ 
            $or: [
                { email },
                { phone },
                { 'shopDetails.licenseNumber': shopDetails.licenseNumber },
                { 'shopDetails.gstNumber': shopDetails.gstNumber }
            ]
        });

        if (existingOwner) {
            return res.status(409).json({
                success: false,
                message: 'Owner already exists with this email, phone, license number, or GST number'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new medical store owner
        const newOwner = new MedicalStoreOwner({
            ownerName,
            email,
            password: hashedPassword,
            phone,
            alternatePhone,
            shopDetails,
            businessInfo
        });

        const savedOwner = await newOwner.save();

        // Create associated shop record
        const newShop = new Shop({
            owner: savedOwner._id,
            operationalStatus: 'closed', // Start as closed until verification
            services: {
                homeDelivery: {
                    available: businessInfo?.deliveryAvailable || false
                }
            }
        });

        await newShop.save();

        // Generate JWT token
        const token = generateToken(savedOwner._id);

        // Return owner data without password
        const ownerResponse = {
            _id: savedOwner._id,
            ownerName: savedOwner.ownerName,
            email: savedOwner.email,
            phone: savedOwner.phone,
            shopDetails: savedOwner.shopDetails,
            accountStatus: savedOwner.accountStatus,
            createdAt: savedOwner.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Medical store owner registered successfully',
            token,
            owner: ownerResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Login Store Owner
const loginStoreOwner = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find owner by email
        const owner = await MedicalStoreOwner.findOne({ email });
        if (!owner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check account status
        if (owner.accountStatus === 'blocked' || owner.accountStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: `Account is ${owner.accountStatus}. Please contact support.`
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, owner.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(owner._id);

        // Get shop details
        const shop = await Shop.findOne({ owner: owner._id });

        // Return owner data without password
        const ownerResponse = {
            _id: owner._id,
            ownerName: owner.ownerName,
            email: owner.email,
            phone: owner.phone,
            shopDetails: owner.shopDetails,
            accountStatus: owner.accountStatus,
            subscription: owner.subscription,
            shop: shop || null
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            owner: ownerResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Owner Profile
const getOwnerProfile = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;

        const owner = await MedicalStoreOwner.findById(ownerId).select('-password');
        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        const shop = await Shop.findOne({ owner: ownerId });

        res.status(200).json({
            success: true,
            message: 'Owner profile retrieved successfully',
            owner,
            shop
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Owner Profile
const updateOwnerProfile = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated this way
        delete updateData.password;
        delete updateData.email;
        delete updateData.accountStatus;

        const updatedOwner = await MedicalStoreOwner.findByIdAndUpdate(
            ownerId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedOwner) {
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            owner: updatedOwner
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Shop Status
const updateShopStatus = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { operationalStatus, statusMessage } = req.body;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const updateData = {};
        if (operationalStatus) updateData.operationalStatus = operationalStatus;
        if (statusMessage) updateData.statusMessage = statusMessage;

        const updatedShop = await Shop.findByIdAndUpdate(
            shop._id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Shop status updated successfully',
            shop: updatedShop
        });

    } catch (error) {
        console.error('Update shop status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Nearby Stores
const getNearbyStores = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const stores = await MedicalStoreOwner.find({
            'shopDetails.location': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            },
            accountStatus: 'active',
            'shopDetails.isActive': true
        }).select('-password').populate({
            path: 'owner',
            model: 'Shop',
            localField: '_id',
            foreignField: 'owner'
        });

        res.status(200).json({
            success: true,
            message: 'Nearby stores retrieved successfully',
            stores,
            count: stores.length
        });

    } catch (error) {
        console.error('Get nearby stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get All Store Owners (Admin)
const getAllStoreOwners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, city, verified } = req.query;

        const filter = {};
        if (status) filter.accountStatus = status;
        if (city) filter['shopDetails.shopAddress.city'] = new RegExp(city, 'i');
        if (verified !== undefined) filter['shopDetails.isVerified'] = verified === 'true';

        const owners = await MedicalStoreOwner.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOwners = await MedicalStoreOwner.countDocuments(filter);
        const totalPages = Math.ceil(totalOwners / limit);

        res.status(200).json({
            success: true,
            message: 'Store owners retrieved successfully',
            data: {
                owners,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalOwners,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all store owners error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Account Status (Admin)
const updateAccountStatus = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { accountStatus, reason } = req.body;

        const validStatuses = ['pending', 'active', 'suspended', 'blocked'];
        if (!validStatuses.includes(accountStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account status'
            });
        }

        const updatedOwner = await MedicalStoreOwner.findByIdAndUpdate(
            ownerId,
            { 
                accountStatus,
                ...(accountStatus === 'active' && { 'shopDetails.verificationDate': new Date() })
            },
            { new: true }
        ).select('-password');

        if (!updatedOwner) {
            return res.status(404).json({
                success: false,
                message: 'Store owner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Account status updated to ${accountStatus}`,
            owner: updatedOwner
        });

    } catch (error) {
        console.error('Update account status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    registerStoreOwner,
    loginStoreOwner,
    getOwnerProfile,
    updateOwnerProfile,
    updateShopStatus,
    getNearbyStores,
    getAllStoreOwners,
    updateAccountStatus
};
