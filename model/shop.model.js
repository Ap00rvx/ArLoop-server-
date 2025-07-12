const mongoose = require('mongoose');

// Shop Schema for additional shop management
const shopSchema = new mongoose.Schema({
    // Reference to Medical Store Owner
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalStoreOwner',
        required: true
    },
    
    // Shop Status Management
    operationalStatus: {
        type: String,
        enum: ['open', 'closed', 'temporarily_closed', 'maintenance'],
        default: 'open'
    },
    
    // Current Status Message
    statusMessage: {
        type: String,
        maxlength: 200
    },
    
    // Shop Performance Metrics
    metrics: {
        totalOrders: {
            type: Number,
            default: 0
        },
        completedOrders: {
            type: Number,
            default: 0
        },
        cancelledOrders: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        averageOrderValue: {
            type: Number,
            default: 0
        },
        customerCount: {
            type: Number,
            default: 0
        }
    },
    
    // Shop Ratings and Reviews
    ratings: {
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        ratingDistribution: {
            fiveStar: { type: Number, default: 0 },
            fourStar: { type: Number, default: 0 },
            threeStar: { type: Number, default: 0 },
            twoStar: { type: Number, default: 0 },
            oneStar: { type: Number, default: 0 }
        }
    },
    
    // Service Features
    services: {
        homeDelivery: {
            available: {
                type: Boolean,
                default: false
            },
            charges: {
                type: Number,
                default: 0
            },
            freeDeliveryAbove: {
                type: Number,
                default: 0
            },
            estimatedTime: {
                type: String,
                default: '30-60 minutes'
            }
        },
        onlinePayment: {
            type: Boolean,
            default: false
        },
        cashOnDelivery: {
            type: Boolean,
            default: true
        },
        prescriptionUpload: {
            type: Boolean,
            default: true
        },
        emergencyService: {
            type: Boolean,
            default: false
        }
    },
    
    // Shop Inventory Summary
    inventory: {
        totalMedicines: {
            type: Number,
            default: 0
        },
        activeMedicines: {
            type: Number,
            default: 0
        },
        outOfStockMedicines: {
            type: Number,
            default: 0
        },
        lowStockMedicines: {
            type: Number,
            default: 0
        },
        expiredMedicines: {
            type: Number,
            default: 0
        },
        totalInventoryValue: {
            type: Number,
            default: 0
        }
    },
    
    // Shop Certifications
    certifications: [{
        name: {
            type: String,
            required: true
        },
        issuedBy: {
            type: String,
            required: true
        },
        issuedDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date
        },
        certificateNumber: {
            type: String,
            required: true
        },
        documentUrl: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    // Shop Announcements
    announcements: [{
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'promotion', 'emergency'],
            default: 'info'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Holiday Schedule
    holidays: [{
        date: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        isRecurring: {
            type: Boolean,
            default: false
        }
    }],
    
    // Emergency Contact
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    
    // Shop Verification Status
    verification: {
        documentsVerified: {
            type: Boolean,
            default: false
        },
        addressVerified: {
            type: Boolean,
            default: false
        },
        licenseVerified: {
            type: Boolean,
            default: false
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        verificationDate: Date,
        verificationNotes: String
    },
    
    // Last Activity
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    
    // Shop Tags for categorization
    tags: [{
        type: String,
        enum: [
            '24x7', 'emergency', 'pediatric', 'cardiac', 'diabetic',
            'ayurvedic', 'homeopathic', 'online', 'home_delivery',
            'senior_friendly', 'wheelchair_accessible'
        ]
    }]
}, {
    timestamps: true
});

// Virtual for shop completion percentage
shopSchema.virtual('profileCompletion').get(function() {
    let completion = 0;
    const totalFields = 10;
    
    // Check various fields and calculate completion
    if (this.owner) completion++;
    if (this.services.homeDelivery.available !== undefined) completion++;
    if (this.services.onlinePayment !== undefined) completion++;
    if (this.certifications && this.certifications.length > 0) completion++;
    if (this.emergencyContact.name) completion++;
    if (this.verification.documentsVerified) completion++;
    if (this.verification.addressVerified) completion++;
    if (this.verification.licenseVerified) completion++;
    if (this.tags && this.tags.length > 0) completion++;
    if (this.operationalStatus) completion++;
    
    return Math.round((completion / totalFields) * 100);
});

// Pre-save middleware to update lastActiveAt
shopSchema.pre('save', function(next) {
    this.lastActiveAt = new Date();
    next();
});

// Add indexes for better query performance
shopSchema.index({ owner: 1 });
shopSchema.index({ operationalStatus: 1 });
shopSchema.index({ 'ratings.averageRating': -1 });
shopSchema.index({ 'services.homeDelivery.available': 1 });
shopSchema.index({ 'verification.documentsVerified': 1 });
shopSchema.index({ tags: 1 });
shopSchema.index({ lastActiveAt: -1 });

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
