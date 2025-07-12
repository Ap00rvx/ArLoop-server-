const mongoose = require('mongoose');

// Medicine Schema
const medicineSchema = new mongoose.Schema({
    // Medicine Basic Information
    medicineName: {
        type: String,
        required: true,
        trim: true
    },
    genericName: {
        type: String,
        required: true,
        trim: true
    },
    brandName: {
        type: String,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    
    // Medicine Classification
    category: {
        type: String,
        required: true,
        enum: [
            'Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Cream', 'Ointment', 
            'Powder', 'Inhaler', 'Spray', 'Gel', 'Lotion', 'Suspension', 'Other'
        ]
    },
    therapeuticClass: {
        type: String,
        required: true,
        enum: [
            'Antibiotic', 'Analgesic', 'Antacid', 'Antidiabetic', 'Antihypertensive',
            'Antihistamine', 'Vitamin', 'Supplement', 'Cardiac', 'Respiratory',
            'Gastrointestinal', 'Neurological', 'Dermatological', 'Other'
        ]
    },
    
    // Medical Store Owner Reference
    storeOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalStoreOwner',
        required: true
    },
    
    // Medicine Details
    composition: {
        type: String,
        required: true
    },
    strength: {
        type: String,
        required: true
    },
    dosageForm: {
        type: String,
        required: true,
        enum: ['Oral', 'Topical', 'Injectable', 'Inhalation', 'Nasal', 'Ophthalmic', 'Otic', 'Rectal']
    },
    
    // Pricing and Stock
    pricing: {
        mrp: {
            type: Number,
            required: true,
            min: 0
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    
    stock: {
        totalQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        availableQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        reservedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },
        minimumStockLevel: {
            type: Number,
            default: 10,
            min: 0
        },
        unit: {
            type: String,
            required: true,
            enum: ['Piece', 'Strip', 'Bottle', 'Tube', 'Box', 'Vial', 'Packet']
        }
    },
    
    // Medicine Validity
    batchDetails: [{
        batchNumber: {
            type: String,
            required: true
        },
        manufacturingDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    
    // Prescription Requirements
    prescriptionRequired: {
        type: Boolean,
        default: false
    },
    scheduleType: {
        type: String,
        enum: ['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Narcotic'],
        default: 'OTC'
    },
    
    // Medicine Images
    images: [{
        url: String,
        description: String
    }],
    
    // Medicine Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
        default: 'active'
    },
    
    // Additional Information
    sideEffects: [String],
    contraindications: [String],
    drugInteractions: [String],
    storageConditions: {
        type: String,
        default: 'Store in a cool, dry place'
    },
    
    // SEO and Search
    keywords: [String],
    description: {
        type: String,
        maxlength: 500
    },
    
    // Sales Information
    totalSold: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    // Regulatory Information
    drugLicenseNumber: String,
    hsn_code: String,
    
    // Visibility
    isVisible: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for checking if medicine is expired
medicineSchema.virtual('isExpired').get(function() {
    if (this.batchDetails && this.batchDetails.length > 0) {
        const currentDate = new Date();
        return this.batchDetails.some(batch => batch.expiryDate < currentDate);
    }
    return false;
});

// Virtual for checking low stock
medicineSchema.virtual('isLowStock').get(function() {
    return this.stock.availableQuantity <= this.stock.minimumStockLevel;
});

// Pre-save middleware to calculate discount percentage
medicineSchema.pre('save', function(next) {
    if (this.pricing.mrp && this.pricing.sellingPrice) {
        this.pricing.discountPercentage = Math.round(
            ((this.pricing.mrp - this.pricing.sellingPrice) / this.pricing.mrp) * 100
        );
    }
    next();
});

// Add indexes for better query performance
medicineSchema.index({ medicineName: 'text', genericName: 'text', brandName: 'text' });
medicineSchema.index({ storeOwner: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ therapeuticClass: 1 });
medicineSchema.index({ status: 1 });
medicineSchema.index({ 'pricing.sellingPrice': 1 });
medicineSchema.index({ prescriptionRequired: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
