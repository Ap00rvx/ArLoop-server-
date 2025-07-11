const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/database')
const userRoutes = require('./routes/user.routes')
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

app.get('/', (req, res) => res.send('Arogya Loop Server is running!'))

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    })
})



app.listen(port, () => console.log(`Server running on port ${port}!`))

