const Order = require('../models/Order')
const moment = require('moment')
// Buyurtmalarni olish
exports.getOrders = async (req, res) => {
	try {
		const {
			status,
			startDate,
			endDate,
			search,
			sortField,
			sortOrder,
			page,
			limit,
		} = req.query
		console.log(search, 'search')
		const query = {}

		// Status bo'yicha filter
		if (status) {
			query.status = status
		}

		// Sana bo'yicha filter (startDate va endDate)
		if (startDate || endDate) {
			query.createdAt = {}
			if (startDate) {
				query.createdAt.$gte = moment
					.utc(startDate, 'MM-DD-YYYY')
					.startOf('day')
					.toDate()
			}
			if (endDate) {
				query.createdAt.$lte = moment
					.utc(endDate, 'MM-DD-YYYY')
					.endOf('day')
					.toDate()
			}
		}
		// Qidiruv bo'yicha filter (customerName yoki orderId)

		if (search) {
			const searchQuery = isNaN(Number(search))
				? { $regex: search, $options: 'i' }
				: Number(search)

			if (isNaN(Number(search))) {
				// If search term is not a number, only search by productTitle
				query.productTitle = { $regex: search, $options: 'i' }
			} else {
				// If search term is a number, search by both productTitle and orderId
				query.$or = [
					{ productTitle: { $regex: search, $options: 'i' } },
					{ orderId: searchQuery },
				]
			}
		}

		// Sortirovka qilish
		const sortOptions = { createdAt: -1 }
		if (sortField) {
			sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1
		}

		// Paginatsiya qilish
		const pageNum = parseInt(page) || 1
		const limitNum = parseInt(limit) || 10
		const skip = (pageNum - 1) * limitNum

		// Buyurtmalarni olish
		const orders = await Order.find(query)
			.sort(sortOptions)
			.skip(skip)
			.limit(limitNum)

		const total = await Order.countDocuments(query)

		res.status(200).json({ orders, total })
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err })
	}
}

// Yangi buyurtma yaratish
exports.createOrder = async (req, res) => {
	try {
		const { productTitle, price, status, count, details } = req.body

		// Check if all required fields are present
		if (!productTitle || !price || !status || !count) {
			return res.status(400).json({ message: 'All fields are required' })
		}

		const order = new Order({
			productTitle,
			status,
			price,
			count,
			details,
		})

		await order.save()
		res.status(201).json(order)
	} catch (err) {
		console.error(err) // Log the error for debugging
		res.status(500).json({ message: 'Server error' })
	}
}

// Buyurtmani yangilash
exports.updateOrder = async (req, res) => {
	try {
		const { id } = req.params
		const updates = req.body

		const order = await Order.findByIdAndUpdate(id, updates, { new: true })

		if (!order) {
			return res.status(404).json({ message: 'Order not found' })
		}

		res.status(200).json(order)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Buyurtmani o'chirish
exports.deleteOrder = async (req, res) => {
	try {
		const { id } = req.params

		const order = await Order.findByIdAndDelete(id)

		if (!order) {
			return res.status(404).json({ message: 'Order not found' })
		}

		res.status(200).json({ message: 'Order deleted' })
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}
