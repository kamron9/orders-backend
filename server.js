const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const orderRoutes = require('./routes/orderRoutes')
const bodyParser = require('body-parser')
const Order = require('./models/Order')
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000
const MONGO_URI =
	'mongodb+srv://kamronalimov80:kamron@ordercluster.dspi1.mongodb.net/?retryWrites=true&w=majority&appName=orderCluster'

mongoose
	.connect(MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000,
	})
	.then(() => {
		console.log('MongoDB connected')
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`)
		})
	})
	.catch(err => {
		console.error('Database connection error:', err)
	})

// Buyurtma marshrutlarini ulash
app.use('/api/orders', orderRoutes)

