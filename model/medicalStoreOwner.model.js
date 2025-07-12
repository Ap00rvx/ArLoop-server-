const mongoose = require('mongoose');

// Medical Store Owner Schema
const medicalStoreOwnerSchema = new mongoose.Schema({
    // Owner Personal Information
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    alternatePhone: {
        type: String,
        minlength: 10,
        maxlength: 10
    },
    
    // Shop Information
    shopDetails: {
        shopName: {
            type: String,
            required: true,
            trim: true
        },
        shopAddress: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true,
                minlength: 6,
                maxlength: 6
            },
            landmark: {
                type: String
            }
        },
        
        // Location coordinates
        location: {
            latitude: {
                type: Number,
                required: true,
                min: -90,
                max: 90
            },
            longitude: {
                type: Number,
                required: true,
                min: -180,
                max: 180
            }
        },
        
        // Shop License and Registration
        licenseNumber: {
            type: String,
            required: true,
            unique: true
        },
        gstNumber: {
            type: String,
            required: true,
            unique: true
        },
        establishedYear: {
            type: Number,
            min: 1900,
            max: new Date().getFullYear()
        },
        
        // Shop Timing
        workingHours: {
            openTime: {
                type: String,
                required: true,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            },
            closeTime: {
                type: String,
                required: true,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            },
            workingDays: [{
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }]
        },
        
        // Shop Images
        shopImages: [{
            url: String,
            description: String
        }],
        
        // Shop Status
        isActive: {
            type: Boolean,
            default: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationDate: {
            type: Date
        }
    },
    
    // Account Status
    accountStatus: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'blocked'],
        default: 'pending'
    },
    
    // Profile Image
    profileImage: {
        type: String
    },
    
    // Subscription Details
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'premium', 'enterprise'],
            default: 'basic'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    
    // Business Information
    businessInfo: {
        yearsInBusiness: {
            type: Number,
            min: 0
        },
        specializations: [{
            type: String,
            enum: ['General Medicine', 'Pediatric', 'Cardiac', 'Diabetic', 'Ayurvedic', 'Homeopathic', 'Veterinary']
        }],
        deliveryAvailable: {
            type: Boolean,
            default: false
        },
        deliveryRadius: {
            type: Number, // in kilometers
            default: 0
        },
        minimumOrderAmount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
medicalStoreOwnerSchema.index({ email: 1 });
medicalStoreOwnerSchema.index({ phone: 1 });
medicalStoreOwnerSchema.index({ 'shopDetails.licenseNumber': 1 });
medicalStoreOwnerSchema.index({ 'shopDetails.location': '2dsphere' });
medicalStoreOwnerSchema.index({ 'shopDetails.shopAddress.city': 1 });
medicalStoreOwnerSchema.index({ 'shopDetails.shopAddress.pincode': 1 });

const MedicalStoreOwner = mongoose.model('MedicalStoreOwner', medicalStoreOwnerSchema);
module.exports = MedicalStoreOwner;
