const { randomBytes, randomUUID } = require('crypto')
const Order = require('../models/Order')
const Payment = require('../models/Payment')
const Delivery = require('../models/Delivery')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const {
  getProvider,
  getPublicPaymentConfig,
  isProviderConfigured,
} = require('../services/payment')

const isStaff = (req) => ['employee', 'manager', 'admin'].includes(req.user.role)

const canManagePayment = (req, payment) =>
  payment.user.toString() === req.user._id.toString() || isStaff(req)

const methodLabel = (method) =>
  getPublicPaymentConfig().methods.find((item) => item.value === method)?.label || method

const markOrderPaid = async (order, note) => {
  if (!order || order.paymentStatus === 'paid') return order

  order.paymentStatus = 'paid'
  if (order.orderStatus === 'pending') {
    order.orderStatus = 'processing'
    order.statusHistory.push({ status: 'processing', note })
    await Delivery.updateOne(
      { order: order._id },
      {
        $push: {
          trackingEvents: { status: 'processing', note },
        },
      },
    )
  }
  await order.save()
  return order
}

const applyPaymentResult = async (payment, result, note) => {
  if (!result || !['paid', 'failed'].includes(result.status)) return payment
  if (payment.status === result.status) return payment

  payment.status = result.status
  if (result.providerRef && !payment.providerRef) payment.providerRef = result.providerRef

  if (result.status === 'paid') {
    payment.paidAt = payment.paidAt || new Date()
    payment.failureReason = ''
  } else {
    payment.failureReason = result.message || 'Payment was not approved by the provider.'
  }

  await payment.save()

  const order = await Order.findById(payment.order)
  if (result.status === 'paid') {
    await markOrderPaid(order, note)
  } else if (order && order.paymentStatus === 'pending') {
    order.paymentStatus = 'failed'
    await order.save()
  }

  return payment
}

const config = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: getPublicPaymentConfig() })
})

const initiate = asyncHandler(async (req, res) => {
  const { orderId, idempotencyKey } = req.body

  const order = await Order.findById(orderId)
  if (!order) {
    throw ApiError.notFound('Order not found')
  }
  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You cannot pay for this order')
  }
  if (order.orderStatus === 'cancelled') {
    throw ApiError.badRequest('This order has been cancelled')
  }
  if (order.paymentStatus === 'paid') {
    const paid = await Payment.findOne({ order: order._id, status: 'paid' })
    return res.json({
      success: true,
      data: { payment: paid, message: 'This order is already paid.' },
    })
  }
  if (order.paymentMethod === 'cash_on_delivery') {
    return res.json({
      success: true,
      data: {
        payment: null,
        message: 'Pay in cash when you receive or collect your order.',
      },
    })
  }
  if (!isProviderConfigured(order.paymentMethod)) {
    throw new ApiError(
      503,
      `${methodLabel(order.paymentMethod)} is not configured. Contact support or choose another payment method.`,
    )
  }

  const existing = await Payment.findOne({
    order: order._id,
    status: { $in: ['pending', 'paid'] },
  })
  if (existing) {
    return res.json({
      success: true,
      data: { payment: existing, message: 'A payment for this order is already in progress.' },
    })
  }

  const provider = getProvider(order.paymentMethod)
  const paymentData = {
    order: order._id,
    user: req.user._id,
    provider: provider.name,
    method: order.paymentMethod,
    amount: order.total,
    currency: 'RWF',
    status: 'pending',
    idempotencyKey,
  }

  if (order.paymentMethod === 'mtn_momo') {
    paymentData.providerRef = randomUUID()
    paymentData.webhookToken = randomBytes(24).toString('hex')
  }

  const payment = await Payment.create(paymentData)

  let result
  try {
    result = await provider.initiate(payment, order)
  } catch (error) {
    await Payment.deleteOne({ _id: payment._id })
    throw error
  }

  await applyPaymentResult(payment, result, result.message || 'Payment received')

  res.status(201).json({
    success: true,
    data: {
      payment,
      message:
        result.message ||
        (result.status === 'paid' ? 'Payment received.' : 'Payment initiated.'),
      redirectUrl: result.redirectUrl || null,
    },
  })
})

const status = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('order', 'orderNumber total')
  if (!payment) {
    throw ApiError.notFound('Payment not found')
  }

  if (!canManagePayment(req, payment)) {
    throw ApiError.forbidden('You cannot view this payment')
  }

  res.json({ success: true, data: payment })
})

const refresh = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('order', 'orderNumber total')
  if (!payment) {
    throw ApiError.notFound('Payment not found')
  }

  if (!canManagePayment(req, payment)) {
    throw ApiError.forbidden('You cannot refresh this payment')
  }

  if (payment.status === 'pending') {
    const provider = getProvider(payment.provider)
    const result = await provider.verify(payment)
    await applyPaymentResult(payment, result, 'Payment confirmed by provider')
  }

  res.json({ success: true, data: payment })
})

const webhook = asyncHandler(async (req, res) => {
  const reference = req.body?.providerRef || req.body?.referenceId || req.query.ref
  const token = req.query.token || req.body?.token
  const payment = reference ? await Payment.findOne({ providerRef: reference }) : null

  if (!payment) {
    return res.json({ success: true, received: true, ignored: true })
  }

  if (payment.webhookToken && token !== payment.webhookToken) {
    return res.json({ success: true, received: true, ignored: true })
  }

  const payload = { ...(req.body || {}) }
  delete payload.token
  payment.webhookLog.push({ payload })
  await payment.save()

  const provider = getProvider(payment.provider)
  const result = await provider.handleWebhook(req.body || {}, payment)
  await applyPaymentResult(payment, result, 'Payment confirmed via webhook')

  res.json({
    success: true,
    received: true,
    ignored: result?.status === 'pending',
    status: payment.status,
  })
})

module.exports = { config, initiate, status, refresh, webhook }
