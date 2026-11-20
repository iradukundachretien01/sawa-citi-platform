const Cart = require('../models/Cart')
const Order = require('../models/Order')
const Payment = require('../models/Payment')
const Delivery = require('../models/Delivery')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const orderService = require('../services/orderService')

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body)

  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } })
  await order.populate('branch', 'name code address deliveryFee')

  res.status(201).json({ success: true, data: order })
})

const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('branch', 'name code address')
    .sort({ createdAt: -1 })
  res.json({ success: true, data: orders })
})

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('branch', 'name code address phone')
  if (!order) {
    throw ApiError.notFound('Order not found')
  }

  const isOwner = order.user.toString() === req.user._id.toString()
  const isStaff = ['employee', 'manager', 'admin'].includes(req.user.role)
  if (!isOwner && !isStaff) {
    throw ApiError.forbidden('You cannot view this order')
  }

  const delivery = await Delivery.findOne({ order: order._id })
  const payment = await Payment.findOne({ order: order._id })
    .select('-webhookToken')
    .sort({ createdAt: -1 })
  res.json({ success: true, data: { ...order.toJSON(), delivery, payment } })
})

const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate(
    'branch',
    'name code address phone',
  )
  if (!order) {
    throw ApiError.notFound('Order not found')
  }

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      deliveryType: order.deliveryType,
      branch: order.branch,
      statusHistory: order.statusHistory,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.subtotal,
      })),
    },
  })
})

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    throw ApiError.notFound('Order not found')
  }
  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only cancel your own orders')
  }

  const updated = await orderService.cancelOrder(order, req.body.reason || '', req.user._id)
  res.json({ success: true, data: updated })
})

module.exports = { createOrder, myOrders, getOrder, trackOrder, cancelOrder }
