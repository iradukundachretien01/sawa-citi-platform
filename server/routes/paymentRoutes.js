const express = require('express')
const {
  config,
  initiate,
  status,
  refresh,
  webhook,
} = require('../controllers/paymentController')
const { protect } = require('../middleware/auth')
const { checkoutLimiter } = require('../middleware/rateLimit')

const router = express.Router()

router.get('/config', config)
router.post('/webhook', webhook)
router.put('/webhook', webhook)
router.post('/initiate', protect, checkoutLimiter, initiate)
router.post('/:id/refresh', protect, checkoutLimiter, refresh)
router.get('/:id', protect, status)

module.exports = router
