const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/database')

dotenv.config()

// Connect to database
connectDB()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Server running on port ${port}!`))

