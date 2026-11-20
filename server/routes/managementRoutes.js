const express = require('express')
const management = require('../controllers/managementController')
const { protect } = require('../middleware/auth')
const { authorize } = require('../middleware/roles')
const { validate } = require('../middleware/validate')
const { analyticsQuerySchema } = require('../validators/schemas')

const router = express.Router()

router.use(protect)

router.get(
  '/analytics',
  authorize('admin', 'manager'),
  validate({ query: analyticsQuerySchema }),
  management.analytics,
)
router.get('/best-sellers', authorize('admin', 'manager', 'employee'), management.bestSellers)
router.get('/low-stock', authorize('admin', 'manager', 'employee'), management.lowStock)

router.get('/reports/sales.csv', authorize('admin', 'manager'), management.salesCsv)
router.get('/reports/inventory.csv', authorize('admin', 'manager'), management.inventoryCsv)
router.get('/reports/sales', authorize('admin', 'manager'), management.salesReport)

module.exports = router
