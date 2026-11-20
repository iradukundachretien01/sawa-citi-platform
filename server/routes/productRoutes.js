const express = require('express')
const {
  listProducts,
  getProductBySlug,
  getRelated,
} = require('../controllers/productController')
const { validate } = require('../middleware/validate')
const { productQuerySchema } = require('../validators/schemas')

const router = express.Router()

router.get('/', validate({ query: productQuerySchema }), listProducts)
router.get('/:id/related', getRelated)
router.get('/:slug', getProductBySlug)

module.exports = router
