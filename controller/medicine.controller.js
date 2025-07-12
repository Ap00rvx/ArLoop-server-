const Medicine = require('../model/medicine.model');
const MedicalStoreOwner = require('../model/medicalStoreOwner.model');
const Shop = require('../model/shop.model');

// Add Medicine
const addMedicine = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const medicineData = req.body;

        // Verify store owner exists and is active
        const owner = await MedicalStoreOwner.findById(ownerId);
        if (!owner || owner.accountStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Store owner not found or account not active'
            });
        }

        // Validate required fields
        const requiredFields = ['medicineName', 'genericName', 'manufacturer', 'category', 'therapeuticClass', 'composition', 'strength', 'dosageForm'];
        const missingFields = requiredFields.filter(field => !medicineData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check if medicine already exists for this store
        const existingMedicine = await Medicine.findOne({
            storeOwner: ownerId,
            medicineName: medicineData.medicineName,
            genericName: medicineData.genericName,
            strength: medicineData.strength
        });

        if (existingMedicine) {
            return res.status(409).json({
                success: false,
                message: 'Medicine with same name, generic name, and strength already exists'
            });
        }

        // Create new medicine
        const newMedicine = new Medicine({
            ...medicineData,
            storeOwner: ownerId
        });

        const savedMedicine = await newMedicine.save();

        // Update shop inventory count
        await updateShopInventory(ownerId);

        res.status(201).json({
            success: true,
            message: 'Medicine added successfully',
            medicine: savedMedicine
        });

    } catch (error) {
        console.error('Add medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get All Medicines for Store Owner
const getOwnerMedicines = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { category, status, search, therapeuticClass } = req.query;

        const filter = { storeOwner: ownerId };
        
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (therapeuticClass) filter.therapeuticClass = therapeuticClass;
        
        if (search) {
            filter.$or = [
                { medicineName: new RegExp(search, 'i') },
                { genericName: new RegExp(search, 'i') },
                { brandName: new RegExp(search, 'i') },
                { manufacturer: new RegExp(search, 'i') }
            ];
        }

        const medicines = await Medicine.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMedicines = await Medicine.countDocuments(filter);
        const totalPages = Math.ceil(totalMedicines / limit);

        res.status(200).json({
            success: true,
            message: 'Medicines retrieved successfully',
            data: {
                medicines,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMedicines,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get owner medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Medicine
const updateMedicine = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { medicineId } = req.params;
        const updateData = req.body;

        // Find medicine and verify ownership
        const medicine = await Medicine.findOne({ _id: medicineId, storeOwner: ownerId });
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found or you do not have permission to update it'
            });
        }

        // Remove fields that shouldn't be updated directly
        delete updateData.storeOwner;
        delete updateData.totalSold;

        const updatedMedicine = await Medicine.findByIdAndUpdate(
            medicineId,
            updateData,
            { new: true, runValidators: true }
        );

        // Update shop inventory if stock changed
        if (updateData.stock) {
            await updateShopInventory(ownerId);
        }

        res.status(200).json({
            success: true,
            message: 'Medicine updated successfully',
            medicine: updatedMedicine
        });

    } catch (error) {
        console.error('Update medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete Medicine
const deleteMedicine = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { medicineId } = req.params;

        // Find and delete medicine
        const deletedMedicine = await Medicine.findOneAndDelete({ 
            _id: medicineId, 
            storeOwner: ownerId 
        });

        if (!deletedMedicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found or you do not have permission to delete it'
            });
        }

        // Update shop inventory count
        await updateShopInventory(ownerId);

        res.status(200).json({
            success: true,
            message: 'Medicine deleted successfully'
        });

    } catch (error) {
        console.error('Delete medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Search Medicines (Public)
const searchMedicines = async (req, res) => {
    try {
        const { 
            search, 
            latitude, 
            longitude, 
            radius = 10, 
            category, 
            therapeuticClass, 
            prescriptionRequired,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (page - 1) * limit;
        const filter = { status: 'active', isVisible: true };

        // Build search filter
        if (search) {
            filter.$or = [
                { medicineName: new RegExp(search, 'i') },
                { genericName: new RegExp(search, 'i') },
                { brandName: new RegExp(search, 'i') },
                { keywords: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (category) filter.category = category;
        if (therapeuticClass) filter.therapeuticClass = therapeuticClass;
        if (prescriptionRequired !== undefined) filter.prescriptionRequired = prescriptionRequired === 'true';
        
        if (minPrice || maxPrice) {
            filter['pricing.sellingPrice'] = {};
            if (minPrice) filter['pricing.sellingPrice'].$gte = parseFloat(minPrice);
            if (maxPrice) filter['pricing.sellingPrice'].$lte = parseFloat(maxPrice);
        }

        let medicineQuery = Medicine.find(filter)
            .populate('storeOwner', 'ownerName shopDetails accountStatus')
            .sort({ averageRating: -1, totalSold: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // If location provided, filter by nearby stores
        if (latitude && longitude) {
            const nearbyStores = await MedicalStoreOwner.find({
                'shopDetails.location': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(longitude), parseFloat(latitude)]
                        },
                        $maxDistance: radius * 1000
                    }
                },
                accountStatus: 'active',
                'shopDetails.isActive': true
            }).select('_id');

            const storeIds = nearbyStores.map(store => store._id);
            filter.storeOwner = { $in: storeIds };
        }

        const medicines = await Medicine.find(filter)
            .populate('storeOwner', 'ownerName shopDetails accountStatus')
            .sort({ averageRating: -1, totalSold: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalMedicines = await Medicine.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Medicines retrieved successfully',
            data: {
                medicines,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalMedicines / limit),
                    totalMedicines,
                    hasNextPage: page < Math.ceil(totalMedicines / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Search medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Medicine Details
const getMedicineDetails = async (req, res) => {
    try {
        const { medicineId } = req.params;

        const medicine = await Medicine.findOne({ 
            _id: medicineId, 
            status: 'active', 
            isVisible: true 
        }).populate('storeOwner', 'ownerName shopDetails accountStatus');

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medicine details retrieved successfully',
            medicine
        });

    } catch (error) {
        console.error('Get medicine details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Stock
const updateStock = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const { medicineId } = req.params;
        const { operation, quantity, batchDetails } = req.body;

        if (!['add', 'remove', 'set'].includes(operation)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid operation. Use add, remove, or set'
            });
        }

        const medicine = await Medicine.findOne({ _id: medicineId, storeOwner: ownerId });
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        let newQuantity = medicine.stock.availableQuantity;
        
        switch (operation) {
            case 'add':
                newQuantity += quantity;
                break;
            case 'remove':
                newQuantity = Math.max(0, newQuantity - quantity);
                break;
            case 'set':
                newQuantity = quantity;
                break;
        }

        const updateData = {
            'stock.availableQuantity': newQuantity,
            'stock.totalQuantity': newQuantity + medicine.stock.reservedQuantity
        };

        // Update batch details if provided
        if (batchDetails) {
            updateData.batchDetails = batchDetails;
        }

        // Update status based on stock
        if (newQuantity === 0) {
            updateData.status = 'out_of_stock';
        } else if (medicine.status === 'out_of_stock') {
            updateData.status = 'active';
        }

        const updatedMedicine = await Medicine.findByIdAndUpdate(
            medicineId,
            updateData,
            { new: true }
        );

        // Update shop inventory
        await updateShopInventory(ownerId);

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            medicine: updatedMedicine
        });

    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Low Stock Medicines
const getLowStockMedicines = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;

        const lowStockMedicines = await Medicine.find({
            storeOwner: ownerId,
            $expr: { $lte: ['$stock.availableQuantity', '$stock.minimumStockLevel'] },
            status: { $ne: 'discontinued' }
        }).sort({ 'stock.availableQuantity': 1 });

        res.status(200).json({
            success: true,
            message: 'Low stock medicines retrieved successfully',
            medicines: lowStockMedicines,
            count: lowStockMedicines.length
        });

    } catch (error) {
        console.error('Get low stock medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Expired Medicines
const getExpiredMedicines = async (req, res) => {
    try {
        const ownerId = req.user.ownerId;
        const currentDate = new Date();

        const expiredMedicines = await Medicine.find({
            storeOwner: ownerId,
            'batchDetails.expiryDate': { $lt: currentDate }
        });

        res.status(200).json({
            success: true,
            message: 'Expired medicines retrieved successfully',
            medicines: expiredMedicines,
            count: expiredMedicines.length
        });

    } catch (error) {
        console.error('Get expired medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to update shop inventory counts
const updateShopInventory = async (ownerId) => {
    try {
        const inventoryStats = await Medicine.aggregate([
            { $match: { storeOwner: ownerId } },
            {
                $group: {
                    _id: null,
                    totalMedicines: { $sum: 1 },
                    activeMedicines: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    outOfStockMedicines: {
                        $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] }
                    },
                    lowStockMedicines: {
                        $sum: { 
                            $cond: [
                                { $lte: ['$stock.availableQuantity', '$stock.minimumStockLevel'] }, 
                                1, 
                                0
                            ] 
                        }
                    },
                    totalInventoryValue: {
                        $sum: { 
                            $multiply: ['$stock.availableQuantity', '$pricing.sellingPrice'] 
                        }
                    }
                }
            }
        ]);

        const stats = inventoryStats[0] || {
            totalMedicines: 0,
            activeMedicines: 0,
            outOfStockMedicines: 0,
            lowStockMedicines: 0,
            totalInventoryValue: 0
        };

        await Shop.findOneAndUpdate(
            { owner: ownerId },
            { 
                'inventory.totalMedicines': stats.totalMedicines,
                'inventory.activeMedicines': stats.activeMedicines,
                'inventory.outOfStockMedicines': stats.outOfStockMedicines,
                'inventory.lowStockMedicines': stats.lowStockMedicines,
                'inventory.totalInventoryValue': stats.totalInventoryValue
            }
        );
    } catch (error) {
        console.error('Update shop inventory error:', error);
    }
};

module.exports = {
    addMedicine,
    getOwnerMedicines,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    getMedicineDetails,
    updateStock,
    getLowStockMedicines,
    getExpiredMedicines
};
