const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Inventory = require('../models/Inventory')
const InventoryMovement = require('../models/InventoryMovement')
const Branch = require('../models/Branch')
const Order = require('../models/Order')
const Promotion = require('../models/Promotion')
const Review = require('../models/Review')
const Delivery = require('../models/Delivery')
const Notification = require('../models/Notification')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { slugify } = require('../utils/helpers')
const orderService = require('../services/orderService')
const { applyInventoryMovement } = require('../services/inventoryMovementService')
const { importProducts } = require('../services/catalogImportService')

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function uniqueSlug(Model, name, excludeId) {
  const base = slugify(name)
  let slug = base
  let counter = 2
  while (
    await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    slug = `${base}-${counter}`
    counter += 1
  }
  return slug
}

const dashboard = asyncHandler(async (_req, res) => {
  const [totalProducts, totalCustomers, totalOrders, pendingOrders, lowStockCount] =
    await Promise.all([
      Product.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['pending', 'processing', 'ready'] } }),
      Inventory.countDocuments({
        $expr: { $lte: [{ $subtract: ['$quantity', '$reserved'] }, '$lowStockThreshold'] },
      }),
    ])

  const revenueRows = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
    { $group: { _id: null, revenue: { $sum: '$total' }, paidOrders: { $sum: 1 } } },
  ])
  const revenue = revenueRows[0]?.revenue || 0
  const paidOrders = revenueRows[0]?.paidOrders || 0

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .populate('branch', 'name')
    .sort({ createdAt: -1 })
    .limit(6)

  res.json({
    success: true,
    data: {
      totals: {
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockCount,
        revenue,
        paidOrders,
        avgOrderValue: paidOrders ? Math.round(revenue / paidOrders) : 0,
      },
      recentOrders,
    },
  })
})

const listOrders = asyncHandler(async (req, res) => {
  const { status, q, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.orderStatus = status
  if (q) filter.orderNumber = new RegExp(escapeRegex(q), 'i')

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(100, Math.max(1, Number(limit)))

  const total = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .populate('branch', 'name code')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) || 0 },
  })
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    throw ApiError.notFound('Order not found')
  }

  const { status, note } = req.body

  if (status === 'cancelled') {
    const cancelled = await orderService.cancelOrder(order, note || 'Cancelled by staff', req.user._id)
    await Notification.create({
      user: order.user,
      type: 'order',
      title: 'Order cancelled',
      message: `Order ${order.orderNumber} was cancelled.`,
      link: '/account/orders',
    })
    return res.json({ success: true, data: cancelled })
  }

  if (order.orderStatus === 'cancelled') {
    throw ApiError.badRequest('Cancelled orders cannot change status')
  }

  order.orderStatus = status
  order.statusHistory.push({ status, note: note || '' })
  if (status === 'completed' && order.paymentMethod === 'cash_on_delivery') {
    order.paymentStatus = 'paid'
  }
  await order.save()

  await Delivery.updateOne(
    { order: order._id },
    { $push: { trackingEvents: { status, note: note || '' } } },
  )

  await Notification.create({
    user: order.user,
    type: 'order',
    title: 'Order updated',
    message: `Order ${order.orderNumber} is now ${status.replace(/_/g, ' ')}.`,
    link: '/account/orders',
  })

  res.json({ success: true, data: order })
})

const listCustomers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query
  const filter = { role: 'customer' }
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }]
  }

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(100, Math.max(1, Number(limit)))
  const total = await User.countDocuments(filter)
  const customers = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.json({
    success: true,
    data: customers,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) || 0 },
  })
})

const updateCustomerStatus = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' })
  if (!customer) {
    throw ApiError.notFound('Customer not found')
  }
  customer.status = req.body.status
  if (req.body.status === 'suspended') customer.tokenVersion += 1
  await customer.save()
  res.json({ success: true, data: customer })
})

const listAdminProducts = asyncHandler(async (req, res) => {
  const { q, status, category, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (category) filter.category = category
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ name: regex }, { sku: regex }, { barcode: regex }, { brand: regex }]
  }

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(100, Math.max(1, Number(limit)))
  const total = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) || 0 },
  })
})

const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body }
  payload.sku = String(payload.sku).trim().toUpperCase()
  payload.barcode = String(payload.barcode || '').trim()
  payload.slug = await uniqueSlug(Product, payload.name)

  if (await Product.exists({ sku: payload.sku })) {
    throw ApiError.conflict('A product with this SKU already exists')
  }
  if (payload.barcode && (await Product.exists({ barcode: payload.barcode }))) {
    throw ApiError.conflict('A product with this barcode already exists')
  }

  const product = await Product.create(payload)

  const branches = await Branch.find({ isActive: true })
  if (branches.length) {
    await Inventory.insertMany(
      branches.map((branch) => ({
        product: product._id,
        branch: branch._id,
        quantity: 0,
        reserved: 0,
      })),
    )
  }

  res.status(201).json({ success: true, data: product })
})

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    throw ApiError.notFound('Product not found')
  }

  const payload = { ...req.body }
  if (payload.sku !== undefined) payload.sku = String(payload.sku).trim().toUpperCase()
  if (payload.barcode !== undefined) payload.barcode = String(payload.barcode).trim()
  if (payload.name && payload.name !== product.name) {
    payload.slug = await uniqueSlug(Product, payload.name, product._id)
  }
  if (payload.sku && payload.sku !== product.sku) {
    if (await Product.exists({ sku: payload.sku, _id: { $ne: product._id } })) {
      throw ApiError.conflict('A product with this SKU already exists')
    }
  }
  if (
    payload.barcode &&
    payload.barcode !== product.barcode &&
    (await Product.exists({ barcode: payload.barcode, _id: { $ne: product._id } }))
  ) {
    throw ApiError.conflict('A product with this barcode already exists')
  }

  Object.assign(product, payload)
  await product.save()
  res.json({ success: true, data: product })
})

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: 'inactive' },
    { new: true },
  )
  if (!product) {
    throw ApiError.notFound('Product not found')
  }
  res.json({ success: true, message: 'Product archived', data: product })
})

const createCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body }
  payload.slug = payload.slug || (await uniqueSlug(Category, payload.name))
  const category = await Category.create(payload)
  res.status(201).json({ success: true, data: category })
})

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    throw ApiError.notFound('Category not found')
  }
  Object.assign(category, req.body)
  await category.save()
  res.json({ success: true, data: category })
})

const deleteCategory = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id })
  if (productCount > 0) {
    throw ApiError.badRequest('Move or archive the products in this category first')
  }
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) {
    throw ApiError.notFound('Category not found')
  }
  res.json({ success: true, message: 'Category deleted' })
})

const listInventory = asyncHandler(async (req, res) => {
  const { branch, lowStock } = req.query
  const filter = {}
  if (branch) filter.branch = branch
  if (lowStock === 'true') {
    filter.$expr = {
      $lte: [{ $subtract: ['$quantity', '$reserved'] }, '$lowStockThreshold'],
    }
  }

  const rows = await Inventory.find(filter)
    .populate('product', 'name sku barcode images price status')
    .populate('branch', 'name code')
    .sort({ updatedAt: -1 })

  res.json({ success: true, data: rows })
})

const updateInventory = asyncHandler(async (req, res) => {
  const row = await Inventory.findById(req.params.id)
  if (!row) {
    throw ApiError.notFound('Inventory record not found')
  }
  if (req.body.quantity !== undefined && req.body.quantity !== row.quantity) {
    await applyInventoryMovement({
      inventoryId: row._id,
      targetQuantity: req.body.quantity,
      type: 'adjustment',
      source: 'admin',
      reason: req.body.reason,
      performedBy: req.user._id,
    })
  }
  if (req.body.lowStockThreshold !== undefined) {
    await Inventory.updateOne(
      { _id: row._id },
      { $set: { lowStockThreshold: req.body.lowStockThreshold } },
    )
  }
  const updated = await Inventory.findById(row._id)
  res.json({ success: true, data: updated })
})

const adjustInventory = asyncHandler(async (req, res) => {
  const row = await Inventory.findById(req.params.id)
  if (!row) {
    throw ApiError.notFound('Inventory record not found')
  }
  const updated = await applyInventoryMovement({
    inventoryId: row._id,
    quantityDelta: req.body.delta,
    type: 'adjustment',
    source: 'admin',
    reason: req.body.reason,
    performedBy: req.user._id,
  })
  res.json({ success: true, data: updated })
})

const listInventoryMovements = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id)
  if (!inventory) throw ApiError.notFound('Inventory record not found')

  const movements = await InventoryMovement.find({ inventory: inventory._id })
    .populate('performedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(100)

  res.json({ success: true, data: movements })
})

const importCatalogProducts = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose a CSV or Excel .xlsx file to import')
  const result = await importProducts(req.file, {
    branchId: req.body.branchId,
    userId: req.user._id,
  })
  res.json({ success: true, data: result })
})

const csvCell = (value) => {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

const exportProductsCsv = asyncHandler(async (_req, res) => {
  const [products, branches] = await Promise.all([
    Product.find().populate('category', 'name').sort({ name: 1 }),
    Branch.find({ isActive: true }).sort({ name: 1 }),
  ])
  const inventories = await Inventory.find({
    product: { $in: products.map((product) => product._id) },
  })
  const inventoryMap = new Map(
    inventories.map((row) => [`${row.product}:${row.branch}`, row.quantity]),
  )
  const headers = [
    'SKU',
    'Barcode',
    'Product Name',
    'Category',
    'Price RWF',
    'Stock Quantity',
    'Branch Code',
    'Image URL',
  ]
  const lines = [headers.map(csvCell).join(',')]

  for (const product of products) {
    const productBranches = branches.length ? branches : [null]
    for (const branch of productBranches) {
      const quantity = branch
        ? inventoryMap.get(`${product._id}:${branch._id}`) ?? 0
        : 0
      lines.push(
        [
          product.sku,
          product.barcode,
          product.name,
          product.category?.name || '',
          product.price,
          quantity,
          branch?.code || '',
          product.images[0] || '',
        ]
          .map(csvCell)
          .join(','),
      )
    }
  }

  res
    .set('Content-Type', 'text/csv; charset=utf-8')
    .set('Content-Disposition', `attachment; filename="sawa-citi-catalog-${new Date().toISOString().slice(0, 10)}.csv"`)
    .send(`\uFEFF${lines.join('\r\n')}`)
})

const listPromotions = asyncHandler(async (_req, res) => {
  const promotions = await Promotion.find().sort({ createdAt: -1 })
  res.json({ success: true, data: promotions })
})

const createPromotion = asyncHandler(async (req, res) => {
  const payload = { ...req.body, code: String(req.body.code).toUpperCase() }
  if (await Promotion.exists({ code: payload.code })) {
    throw ApiError.conflict('A promotion with this code already exists')
  }
  if (!payload.startsAt) payload.startsAt = new Date()
  const promotion = await Promotion.create(payload)
  res.status(201).json({ success: true, data: promotion })
})

const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id)
  if (!promotion) {
    throw ApiError.notFound('Promotion not found')
  }
  if (req.body.code) req.body.code = String(req.body.code).toUpperCase()
  Object.assign(promotion, req.body)
  await promotion.save()
  res.json({ success: true, data: promotion })
})

const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id)
  if (!promotion) {
    throw ApiError.notFound('Promotion not found')
  }
  res.json({ success: true, message: 'Promotion deleted' })
})

const listBranches = asyncHandler(async (_req, res) => {
  const branches = await Branch.find().sort({ name: 1 })
  res.json({ success: true, data: branches })
})

const createBranch = asyncHandler(async (req, res) => {
  const payload = { ...req.body, code: String(req.body.code).toUpperCase() }
  if (await Branch.exists({ code: payload.code })) {
    throw ApiError.conflict('A branch with this code already exists')
  }
  const branch = await Branch.create(payload)

  const products = await Product.find({ status: 'active' })
  if (products.length) {
    await Inventory.insertMany(
      products.map((product) => ({
        product: product._id,
        branch: branch._id,
        quantity: 0,
        reserved: 0,
      })),
    )
  }

  res.status(201).json({ success: true, data: branch })
})

const updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id)
  if (!branch) {
    throw ApiError.notFound('Branch not found')
  }
  if (req.body.code) req.body.code = String(req.body.code).toUpperCase()
  Object.assign(branch, req.body)
  await branch.save()
  res.json({ success: true, data: branch })
})

const listEmployees = asyncHandler(async (_req, res) => {
  const employees = await User.find({ role: { $in: ['employee', 'manager', 'admin'] } }).sort({
    createdAt: -1,
  })
  res.json({ success: true, data: employees })
})

const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body
  if (await User.exists({ email: email.toLowerCase() })) {
    throw ApiError.conflict('An account with this email already exists')
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const employee = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role,
  })
  res.status(201).json({ success: true, data: employee })
})

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({
    _id: req.params.id,
    role: { $in: ['employee', 'manager', 'admin'] },
  })
  if (!employee) {
    throw ApiError.notFound('Staff member not found')
  }
  if (req.body.role) employee.role = req.body.role
  if (req.body.name) employee.name = req.body.name
  if (req.body.phone !== undefined) employee.phone = req.body.phone
  if (req.body.status) {
    employee.status = req.body.status
    if (req.body.status === 'suspended') employee.tokenVersion += 1
  }
  await employee.save()
  res.json({ success: true, data: employee })
})

const listReviews = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.approved === 'false') filter.status = 'pending'
  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 })
  res.json({ success: true, data: reviews })
})

const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    throw ApiError.notFound('Review not found')
  }
  review.status =
    req.body.status || (req.body.isApproved ? 'approved' : 'rejected')
  await review.save()
  res.json({ success: true, data: review })
})

module.exports = {
  dashboard,
  listOrders,
  updateOrderStatus,
  listCustomers,
  updateCustomerStatus,
  listAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  listInventory,
  updateInventory,
  adjustInventory,
  listInventoryMovements,
  importCatalogProducts,
  exportProductsCsv,
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  listBranches,
  createBranch,
  updateBranch,
  listEmployees,
  createEmployee,
  updateEmployee,
  listReviews,
  moderateReview,
}
