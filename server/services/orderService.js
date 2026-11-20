const Branch = require('../models/Branch')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Delivery = require('../models/Delivery')
const Promotion = require('../models/Promotion')
const Notification = require('../models/Notification')
const ApiError = require('../utils/ApiError')
const { generateOrderNumber } = require('../utils/helpers')
const stockService = require('./stockService')

const calculateDiscount = (promotion, subtotal) => {
  if (!promotion) return 0
  const raw =
    promotion.type === 'percentage'
      ? Math.floor((subtotal * promotion.value) / 100)
      : promotion.value
  return Math.max(0, Math.min(raw, subtotal))
}

async function findValidPromotion(code, subtotal) {
  if (!code) return null
  const now = new Date()
  const promotion = await Promotion.findOne({
    code: String(code).toUpperCase(),
    isActive: true,
    startsAt: { $lte: now },
    $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
  })

  if (!promotion) {
    throw ApiError.badRequest('Promotion code is invalid or has expired')
  }
  if (subtotal < promotion.minSpend) {
    throw ApiError.badRequest(
      `This promotion requires a minimum spend of RWF ${promotion.minSpend.toLocaleString('en-RW')}`,
    )
  }
  if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
    throw ApiError.badRequest('This promotion has reached its usage limit')
  }
  return promotion
}

async function createOrder(user, payload) {
  const {
    items = [],
    deliveryType = 'delivery',
    substitutionPreference = 'ask_first',
    branchId,
    shippingAddress = {},
    paymentMethod = 'mock',
    promotionCode = '',
    idempotencyKey,
  } = payload

  if (idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey })
    if (existing) return existing
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('Your cart is empty')
  }

  const branch = await Branch.findById(branchId)
  if (!branch || !branch.isActive) {
    throw ApiError.badRequest('Please choose a valid branch')
  }
  if (deliveryType === 'delivery' && !branch.supportsDelivery) {
    throw ApiError.badRequest('This branch does not support delivery')
  }
  if (deliveryType === 'collection' && !branch.supportsCollection) {
    throw ApiError.badRequest('This branch does not support collection')
  }

  const productIds = items.map((item) => item.productId)
  const products = await Product.find({ _id: { $in: productIds }, status: 'active' })
  const productMap = new Map(products.map((product) => [product._id.toString(), product]))

  const normalizedItems = items.map((item) => {
    const product = productMap.get(String(item.productId))
    if (!product) {
      throw ApiError.badRequest('One of the products in your cart is no longer available')
    }
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw ApiError.badRequest(`Invalid quantity for ${product.name}`)
    }
    return { product, quantity }
  })

  const reservations = await stockService.reserveStock(
    normalizedItems.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      name: item.product.name,
    })),
    branch._id,
    user._id,
  )

  try {
    const orderItems = normalizedItems.map((item) => {
      const unitPrice = item.product.effectivePrice
      return {
        product: item.product._id,
        name: item.product.name,
        sku: item.product.sku,
        image: item.product.images[0] || '',
        unit: item.product.size || item.product.weight || '',
        price: unitPrice,
        quantity: item.quantity,
        subtotal: unitPrice * item.quantity,
      }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const deliveryFee = deliveryType === 'delivery' ? branch.deliveryFee : 0
    const promotion = await findValidPromotion(promotionCode, subtotal)
    const discount = calculateDiscount(promotion, subtotal)
    const total = subtotal + deliveryFee - discount

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: user._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      deliveryType,
      substitutionPreference,
      branch: branch._id,
      shippingAddress: {
        line1: shippingAddress.line1 || '',
        city: shippingAddress.city || 'Kigali',
        phone: shippingAddress.phone || user.phone || '',
        notes: shippingAddress.notes || '',
      },
      promotionCode: promotion ? promotion.code : '',
      idempotencyKey,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    })

    await Delivery.create({
      order: order._id,
      method: deliveryType,
      fee: deliveryFee,
      trackingEvents: [{ status: 'pending', note: 'Order received' }],
    })

    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { soldCount: item.quantity } }),
      ),
    )

    if (promotion) {
      await Promotion.updateOne({ _id: promotion._id }, { $inc: { usedCount: 1 } })
    }

    await stockService.commitReserved(reservations, order._id)

    try {
      await Notification.create({
        user: user._id,
        type: 'order',
        title: 'Order placed',
        message: `Your order ${order.orderNumber} has been received.`,
        link: '/account/orders',
      })
    } catch (notificationError) {
      console.error('Could not create order notification:', notificationError.message)
    }

    return order
  } catch (error) {
    await stockService.releaseReserved(reservations)
    throw error
  }
}

async function cancelOrder(order, reason = '', performedBy = order.user) {
  if (['cancelled', 'completed'].includes(order.orderStatus)) {
    throw ApiError.badRequest(`This order is already ${order.orderStatus}`)
  }

  order.orderStatus = 'cancelled'
  order.statusHistory.push({
    status: 'cancelled',
    note: reason || 'Cancelled by customer',
  })
  await order.save()

  await stockService.restoreStock(order.items, order.branch, order._id, performedBy)

  await Delivery.updateOne(
    { order: order._id },
    {
      $push: { trackingEvents: { status: 'cancelled', note: reason || 'Order cancelled' } },
    },
  )

  return order
}

module.exports = { createOrder, cancelOrder }
