const Order = require('../models/Order')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Inventory = require('../models/Inventory')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { toCsv } = require('../utils/helpers')

const startOfDay = (date) => {
  const copy = new Date(date)
  copy.setUTCHours(0, 0, 0, 0)
  return copy
}

const weekStart = (date) => {
  const copy = startOfDay(date)
  const day = copy.getUTCDay()
  const diff = (day + 6) % 7
  copy.setUTCDate(copy.getUTCDate() - diff)
  return copy
}

const bucketKey = (date, range) => {
  if (range === 'monthly') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  }
  if (range === 'weekly') {
    return weekStart(date).toISOString().slice(0, 10)
  }
  return startOfDay(date).toISOString().slice(0, 10)
}

function buildBuckets(range) {
  const now = new Date()
  const buckets = []

  if (range === 'monthly') {
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      const key = bucketKey(date, 'monthly')
      buckets.push({ key, label: key })
    }
  } else if (range === 'weekly') {
    for (let i = 7; i >= 0; i -= 1) {
      const date = new Date(now)
      date.setUTCDate(date.getUTCDate() - i * 7)
      const key = bucketKey(date, 'weekly')
      buckets.push({ key, label: `Week of ${key}` })
    }
  } else {
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(now)
      date.setUTCDate(date.getUTCDate() - i)
      const key = bucketKey(date, 'daily')
      buckets.push({ key, label: key })
    }
  }

  return buckets
}

const analytics = asyncHandler(async (req, res) => {
  const { range } = req.query
  const buckets = buildBuckets(range)
  const firstKey = buckets[0].key

  const since =
    range === 'monthly'
      ? new Date(`${firstKey}-01T00:00:00.000Z`)
      : range === 'weekly'
        ? new Date(`${firstKey}T00:00:00.000Z`)
        : new Date(`${firstKey}T00:00:00.000Z`)

  const orders = await Order.find({
    orderStatus: { $ne: 'cancelled' },
    createdAt: { $gte: since },
  }).select('items total paymentMethod createdAt')

  const [products, categories] = await Promise.all([
    Product.find().select('category'),
    Category.find().select('name'),
  ])
  const productCategory = new Map(products.map((product) => [product._id.toString(), product.category]))
  const categoryName = new Map(categories.map((category) => [category._id.toString(), category.name]))

  const seriesMap = new Map(
    buckets.map((bucket) => [bucket.key, { label: bucket.label, revenue: 0, orders: 0 }]),
  )
  const categoryMap = new Map()
  const paymentMap = new Map()

  let revenue = 0
  let itemsSold = 0

  for (const order of orders) {
    const key = bucketKey(new Date(order.createdAt), range)
    const bucket = seriesMap.get(key)
    if (bucket) {
      bucket.revenue += order.total
      bucket.orders += 1
    }

    revenue += order.total
    paymentMap.set(order.paymentMethod, (paymentMap.get(order.paymentMethod) || 0) + 1)

    for (const item of order.items) {
      itemsSold += item.quantity
      const categoryId = productCategory.get(item.product?.toString())
      const name = categoryName.get(categoryId?.toString()) || 'Uncategorised'
      const entry = categoryMap.get(name) || { name, revenue: 0, quantity: 0 }
      entry.revenue += item.subtotal
      entry.quantity += item.quantity
      categoryMap.set(name, entry)
    }
  }

  res.json({
    success: true,
    data: {
      range,
      totals: {
        revenue,
        orders: orders.length,
        itemsSold,
        avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
      },
      series: [...seriesMap.values()],
      categories: [...categoryMap.values()].sort((a, b) => b.revenue - a.revenue),
      paymentMethods: [...paymentMap.entries()].map(([method, count]) => ({ method, count })),
    },
  })
})

const bestSellers = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 5))

  const rows = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: limit },
  ])

  res.json({ success: true, data: rows })
})

const lowStock = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold)
  const match = Number.isFinite(threshold)
    ? { $lte: [{ $subtract: ['$quantity', '$reserved'] }, threshold] }
    : { $lte: [{ $subtract: ['$quantity', '$reserved'] }, '$lowStockThreshold'] }

  const rows = await Inventory.find({ $expr: match })
    .populate('product', 'name sku images price status')
    .populate('branch', 'name code')
    .sort({ quantity: 1 })

  res.json({ success: true, data: rows })
})

const salesCsv = asyncHandler(async (req, res) => {
  const range = req.query.range || 'daily'
  const days = range === 'monthly' ? 180 : range === 'weekly' ? 56 : 14
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)

  const orders = await Order.find({
    orderStatus: { $ne: 'cancelled' },
    createdAt: { $gte: since },
  })
    .populate('user', 'name email')
    .sort({ createdAt: 1 })

  const rows = orders.map((order) => ({
    orderNumber: order.orderNumber,
    date: order.createdAt.toISOString(),
    status: order.orderStatus,
    payment: order.paymentStatus,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    customer: order.user?.name || 'Guest',
    email: order.user?.email || '',
  }))

  const csv = toCsv(rows, [
    { key: 'orderNumber', label: 'Order' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'payment', label: 'Payment' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'deliveryFee', label: 'Delivery' },
    { key: 'discount', label: 'Discount' },
    { key: 'total', label: 'Total' },
    { key: 'customer', label: 'Customer' },
    { key: 'email', label: 'Email' },
  ])

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="sawa-citi-sales-${new Date().toISOString().slice(0, 10)}.csv"`,
  )
  res.send(csv)
})

const inventoryCsv = asyncHandler(async (_req, res) => {
  const rows = await Inventory.find()
    .populate('product', 'name sku')
    .populate('branch', 'name code')

  const data = rows.map((row) => ({
    branch: row.branch?.name || '',
    code: row.branch?.code || '',
    product: row.product?.name || '',
    sku: row.product?.sku || '',
    quantity: row.quantity,
    reserved: row.reserved,
    available: row.quantity - row.reserved,
    threshold: row.lowStockThreshold,
    status: row.stockStatus,
  }))

  const csv = toCsv(data, [
    { key: 'branch', label: 'Branch' },
    { key: 'code', label: 'Branch Code' },
    { key: 'product', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'available', label: 'Available' },
    { key: 'threshold', label: 'Low Stock Threshold' },
    { key: 'status', label: 'Status' },
  ])

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="sawa-citi-inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
  )
  res.send(csv)
})

const salesReport = asyncHandler(async (req, res) => {
  const { range } = req.query
  if (!['daily', 'weekly', 'monthly'].includes(range)) {
    throw ApiError.badRequest('Range must be daily, weekly or monthly')
  }
  const days = range === 'monthly' ? 180 : range === 'weekly' ? 56 : 14
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)

  const rows = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: range === 'monthly' ? '%Y-%m' : '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  res.json({
    success: true,
    data: rows.map((row) => ({ period: row._id, revenue: row.revenue, orders: row.orders })),
  })
})

module.exports = { analytics, bestSellers, lowStock, salesCsv, inventoryCsv, salesReport }
