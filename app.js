const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/database')
const userRoutes = require('./routes/user.routes')
const storeOwnerRoutes = require('./routes/medicalStoreOwner.routes')
const medicineRoutes = require('./routes/medicine.routes')
const shopRoutes = require('./routes/shop.routes')
const cors = require('cors')

dotenv.config()

// Connect to database
connectDB()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/store-owners', storeOwnerRoutes)
app.use('/api/medicines', medicineRoutes)
app.use('/api/shop', shopRoutes)

app.get('/', (req, res) => res.json({ 
    message: 'Arogya Loop Server is running!',
    version: '1.0.0',
    endpoints: {
        users: '/api/users',
        storeOwners: '/api/store-owners',
        medicines: '/api/medicines',
        shop: '/api/shop'
    }
}))

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    })
})

// Handle 404 routes
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    })
})

app.listen(port, () => console.log(`Server running on port ${port}!`))

