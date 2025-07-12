const jwt = require('jsonwebtoken');
const MedicalStoreOwner = require('../model/medicalStoreOwner.model');

// JWT Authentication Middleware for Store Owners
const authenticateStoreOwner = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if store owner still exists
        const owner = await MedicalStoreOwner.findById(decoded.ownerId).select('-password');
        if (!owner) {
            return res.status(401).json({
                success: false,
                message: 'Store owner not found'
            });
        }

        // Check if account is active
        if (owner.accountStatus === 'blocked' || owner.accountStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: `Account is ${owner.accountStatus}. Please contact support.`
            });
        }

        // Add owner info to request object
        req.user = decoded;
        req.owner = owner;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        console.error('Store owner authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Optional Authentication Middleware for Store Owners
const optionalStoreOwnerAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const owner = await MedicalStoreOwner.findById(decoded.ownerId).select('-password');
            
            if (owner && owner.accountStatus === 'active') {
                req.user = decoded;
                req.owner = owner;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

// Admin Authentication Middleware (for future admin features)
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Admin access token is required'
            });
        }

        // For now, we'll use a simple admin check
        // In production, you should have a proper Admin model
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's an admin token (you can modify this logic)
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Admin token has expired'
            });
        }

        console.error('Admin authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    authenticateStoreOwner,
    optionalStoreOwnerAuth,
    authenticateAdmin
};
