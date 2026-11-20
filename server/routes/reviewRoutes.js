const express = require('express')
const { listByProduct, create, remove } = require('../controllers/reviewController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { reviewCreateSchema } = require('../validators/schemas')

const router = express.Router()

router.get('/product/:productId', listByProduct)
router.post('/product/:productId', protect, validate({ body: reviewCreateSchema }), create)
router.delete('/:id', protect, remove)

module.exports = router
