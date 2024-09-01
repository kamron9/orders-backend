const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
	productTitle: { type: String, required: true },
	orderId: { type: Number, required: true, unique: true },
	price: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
	status: {
		type: String,
		enum: ['pending', 'sent', 'delivered'],
		required: true,
	},
	count: { type: Number, required: true },
	details: { type: String, required: false },
})

orderSchema.pre('validate', async function (next) {
	if (this.isNew && this.orderId === undefined) {
		try {
			const lastOrder = await this.constructor
				.findOne()
				.sort({ orderId: -1 })
				.exec()
			let newOrderId = lastOrder ? lastOrder.orderId + 1 : 1

			// 3 ta raqamli limitni tekshirish
			if (newOrderId > 999) {
				newOrderId = newOrderId % 1000 // 3 raqamdan oshmasligi uchun limit
			}

			// newOrderId ning to'g'riligini tekshirish
			if (isNaN(newOrderId)) {
				newOrderId = 1 // Agar NaN bo'lsa, 1 ni tayinlash
			}

			this.orderId = newOrderId
		} catch (err) {
			return next(err)
		}
	}
	next()
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
