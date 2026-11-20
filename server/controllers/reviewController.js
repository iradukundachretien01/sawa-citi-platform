const Review = require('../models/Review')
const Product = require('../models/Product')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

async function recalculateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ])

  const row = stats[0]
  await Product.updateOne(
    { _id: productId },
    {
      avgRating: row ? Math.round(row.avgRating * 10) / 10 : 0,
      reviewCount: row ? row.reviewCount : 0,
    },
  )
}

const listByProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
    .populate('user', 'name')
    .sort({ createdAt: -1 })

  res.json({ success: true, data: reviews })
})

const create = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) {
    throw ApiError.notFound('Product not found')
  }

  const existing = await Review.findOne({ product: product._id, user: req.user._id })
  if (existing) {
    throw ApiError.conflict('You have already reviewed this product')
  }

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    status: 'approved',
  })

  await recalculateProductRating(product._id)
  await review.populate('user', 'name')

  res.status(201).json({ success: true, data: review })
})

const remove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    throw ApiError.notFound('Review not found')
  }

  const isOwner = review.user.toString() === req.user._id.toString()
  const isStaff = ['manager', 'admin'].includes(req.user.role)
  if (!isOwner && !isStaff) {
    throw ApiError.forbidden('You cannot delete this review')
  }

  const productId = review.product
  await review.deleteOne()
  await recalculateProductRating(productId)

  res.json({ success: true, message: 'Review deleted' })
})

module.exports = { listByProduct, create, remove, recalculateProductRating }
