const Product = require('../models/Product')
const Category = require('../models/Category')
const Inventory = require('../models/Inventory')
const Branch = require('../models/Branch')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const listProducts = asyncHandler(async (req, res) => {
  const { q, category, brand, minPrice, maxPrice, sort, page, limit, featured, offers } = req.query

  const filter = { status: 'active' }

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ name: regex }, { brand: regex }, { tags: regex }, { description: regex }]
  }

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category })
    if (!categoryDoc) {
      return res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, pages: 0 },
      })
    }
    filter.category = categoryDoc._id
  }

  if (brand) {
    filter.brand = new RegExp(escapeRegex(brand), 'i')
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {}
    if (minPrice !== undefined) filter.price.$gte = minPrice
    if (maxPrice !== undefined) filter.price.$lte = maxPrice
  }

  if (featured === 'true') filter.isFeatured = true

  if (offers === 'true') {
    filter.$expr = {
      $and: [{ $gt: ['$discountPrice', 0] }, { $lt: ['$discountPrice', '$price'] }],
    }
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { avgRating: -1 },
    popular: { soldCount: -1 },
  }

  const total = await Product.countDocuments(filter)
  const pages = Math.ceil(total / limit) || 0

  const products =
    sort === 'savings'
      ? await Product.aggregate([
          { $match: filter },
          {
            $addFields: {
              savingsAmount: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$discountPrice', 0] },
                      { $lt: ['$discountPrice', '$price'] },
                    ],
                  },
                  { $subtract: ['$price', '$discountPrice'] },
                  0,
                ],
              },
            },
          },
          { $sort: { savingsAmount: -1, price: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        ])
      : await Product.find(filter)
          .populate('category', 'name slug')
          .sort(sortMap[sort] || sortMap.newest)
          .skip((page - 1) * limit)
          .limit(limit)

  res.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages },
  })
})

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' }).populate(
    'category',
    'name slug',
  )
  if (!product) {
    throw ApiError.notFound('Product not found')
  }

  const inventory = await Inventory.find({ product: product._id }).populate(
    'branch',
    'name code address deliveryFee',
  )

  res.json({
    success: true,
    data: {
      ...product.toJSON(),
      inventory: inventory.map((row) => ({
        branch: row.branch,
        quantity: row.quantity,
        available: row.available,
        stockStatus: row.stockStatus,
      })),
    },
  })
})

const getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    throw ApiError.notFound('Product not found')
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: 'active',
  })
    .sort({ soldCount: -1 })
    .limit(4)

  res.json({ success: true, data: related })
})

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
  const counts = await Product.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ])
  const countMap = new Map(counts.map((row) => [row._id.toString(), row.count]))

  res.json({
    success: true,
    data: categories.map((category) => ({
      ...category.toJSON(),
      productCount: countMap.get(category._id.toString()) || 0,
    })),
  })
})

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
  if (!category) {
    throw ApiError.notFound('Category not found')
  }
  res.json({ success: true, data: category })
})

const listBranches = asyncHandler(async (_req, res) => {
  const branches = await Branch.find({ isActive: true }).sort({ name: 1 })
  res.json({ success: true, data: branches })
})

module.exports = {
  listProducts,
  getProductBySlug,
  getRelated,
  listCategories,
  getCategoryBySlug,
  listBranches,
}
