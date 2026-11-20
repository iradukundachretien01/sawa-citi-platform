const Cart = require('../models/Cart')
const Product = require('../models/Product')
const Branch = require('../models/Branch')
const Inventory = require('../models/Inventory')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const unitPriceOf = (product) =>
  product.discountPrice > 0 && product.discountPrice < product.price
    ? product.discountPrice
    : product.price

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] })
  }
  return cart
}

async function buildCartResponse(cart) {
  await cart.populate([
    {
      path: 'items.product',
      select: 'name slug images price discountPrice size weight status brand',
    },
    { path: 'items.branch', select: 'name code deliveryFee' },
  ])

  const activeItems = cart.items.filter((item) => item.product)

  const inventories = await Inventory.find({
    product: { $in: activeItems.map((item) => item.product._id) },
  })
  const availabilityMap = new Map(
    inventories.map((row) => [
      `${row.product}-${row.branch}`,
      Math.max(0, row.quantity - row.reserved),
    ]),
  )

  const items = activeItems.map((item) => {
    const unitPrice = unitPriceOf(item.product)
    const available = item.branch
      ? availabilityMap.get(`${item.product._id}-${item.branch._id}`) ?? 0
      : 0
    return {
      product: item.product,
      branch: item.branch,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      available,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { id: cart._id, items, itemCount, subtotal }
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  res.json({ success: true, data: await buildCartResponse(cart) })
})

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity, branchId } = req.body

  const product = await Product.findOne({ _id: productId, status: 'active' })
  if (!product) {
    throw ApiError.notFound('Product not found or unavailable')
  }

  let branch
  if (branchId) {
    branch = await Branch.findOne({ _id: branchId, isActive: true })
  } else {
    branch = await Branch.findOne({ isActive: true }).sort({ name: 1 })
  }
  if (!branch) {
    throw ApiError.badRequest('No active branch available')
  }

  const cart = await getOrCreateCart(req.user._id)
  const existing = cart.items.find((item) => item.product.toString() === productId)
  const desiredQuantity = (existing ? existing.quantity : 0) + quantity

  const inventory = await Inventory.findOne({ product: product._id, branch: branch._id })
  const available = inventory ? Math.max(0, inventory.quantity - inventory.reserved) : 0
  if (available < desiredQuantity) {
    throw ApiError.conflict(
      available > 0
        ? `Only ${available} of ${product.name} available at ${branch.name}`
        : `${product.name} is out of stock at ${branch.name}`,
    )
  }

  if (existing) {
    existing.quantity = desiredQuantity
    existing.branch = branch._id
  } else {
    cart.items.push({ product: product._id, branch: branch._id, quantity })
  }

  await cart.save()
  res.status(201).json({ success: true, data: await buildCartResponse(cart) })
})

const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { quantity } = req.body

  const cart = await getOrCreateCart(req.user._id)
  const item = cart.items.find((entry) => entry.product.toString() === productId)
  if (!item) {
    throw ApiError.notFound('This product is not in your cart')
  }

  if (quantity === 0) {
    cart.items = cart.items.filter((entry) => entry.product.toString() !== productId)
  } else {
    if (item.branch) {
      const inventory = await Inventory.findOne({ product: item.product, branch: item.branch })
      const available = inventory ? Math.max(0, inventory.quantity - inventory.reserved) : 0
      if (available < quantity) {
        throw ApiError.conflict(`Only ${available} available at the selected branch`)
      }
    }
    item.quantity = quantity
  }

  await cart.save()
  res.json({ success: true, data: await buildCartResponse(cart) })
})

const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const cart = await getOrCreateCart(req.user._id)
  cart.items = cart.items.filter((entry) => entry.product.toString() !== productId)
  await cart.save()
  res.json({ success: true, data: await buildCartResponse(cart) })
})

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = []
  await cart.save()
  res.json({ success: true, data: await buildCartResponse(cart) })
})

module.exports = { getCart, addItem, updateItem, removeItem, clearCart }
