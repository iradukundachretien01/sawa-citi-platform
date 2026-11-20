const express = require('express')

const router = express.Router()

router.use('/auth', require('./authRoutes'))
router.use('/products', require('./productRoutes'))
router.use('/categories', require('./categoryRoutes'))
router.use('/branches', require('./branchRoutes'))
router.use('/cart', require('./cartRoutes'))
router.use('/orders', require('./orderRoutes'))
router.use('/payments', require('./paymentRoutes'))
router.use('/reviews', require('./reviewRoutes'))
router.use('/notifications', require('./notificationRoutes'))
router.use('/admin', require('./adminRoutes'))
router.use('/management', require('./managementRoutes'))

module.exports = router
