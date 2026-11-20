const express = require('express')
const {
  createOrder,
  myOrders,
  getOrder,
  trackOrder,
  cancelOrder,
} = require('../controllers/orderController')
const { protect } = require('../middleware/auth')
const { checkoutLimiter } = require('../middleware/rateLimit')
const { validate } = require('../middleware/validate')
const { orderCreateSchema } = require('../validators/schemas')

const router = express.Router()

router.get('/track/:orderNumber', trackOrder)

router.use(protect)

router.post('/', checkoutLimiter, validate({ body: orderCreateSchema }), createOrder)
router.get('/mine', myOrders)
router.get('/:id', getOrder)
router.patch('/:id/cancel', cancelOrder)

module.exports = router
