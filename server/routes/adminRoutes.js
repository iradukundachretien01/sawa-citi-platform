const express = require('express')
const multer = require('multer')
const admin = require('../controllers/adminController')
const ApiError = require('../utils/ApiError')
const { protect } = require('../middleware/auth')
const { authorize } = require('../middleware/roles')
const { validate } = require('../middleware/validate')
const {
  productCreateSchema,
  productUpdateSchema,
  categorySchema,
  categoryUpdateSchema,
  inventoryUpdateSchema,
  inventoryAdjustSchema,
  inventoryImportSchema,
  orderStatusSchema,
  promotionSchema,
  branchSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
} = require('../validators/schemas')

const router = express.Router()
const uploadCatalogFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    const extension = file.originalname.toLowerCase().split('.').pop()
    if (extension !== 'csv' && extension !== 'xlsx') {
      return callback(ApiError.badRequest('Upload a CSV or Excel .xlsx file'))
    }
    return callback(null, true)
  },
})

router.use(protect)

router.get('/dashboard', authorize('admin', 'manager'), admin.dashboard)

router.get('/orders', authorize('admin', 'manager', 'employee'), admin.listOrders)
router.patch(
  '/orders/:id/status',
  authorize('admin', 'manager', 'employee'),
  validate({ body: orderStatusSchema }),
  admin.updateOrderStatus,
)

router.get('/customers', authorize('admin', 'manager'), admin.listCustomers)
router.patch('/customers/:id/status', authorize('admin', 'manager'), admin.updateCustomerStatus)

router.get('/products/export', authorize('admin', 'manager'), admin.exportProductsCsv)
router.post(
  '/products/import',
  authorize('admin', 'manager'),
  uploadCatalogFile.single('file'),
  validate({ body: inventoryImportSchema }),
  admin.importCatalogProducts,
)
router.get('/products', authorize('admin', 'manager'), admin.listAdminProducts)
router.post(
  '/products',
  authorize('admin', 'manager'),
  validate({ body: productCreateSchema }),
  admin.createProduct,
)
router.patch(
  '/products/:id',
  authorize('admin', 'manager'),
  validate({ body: productUpdateSchema }),
  admin.updateProduct,
)
router.delete('/products/:id', authorize('admin'), admin.deleteProduct)

router.post(
  '/categories',
  authorize('admin', 'manager'),
  validate({ body: categorySchema }),
  admin.createCategory,
)
router.patch(
  '/categories/:id',
  authorize('admin', 'manager'),
  validate({ body: categoryUpdateSchema }),
  admin.updateCategory,
)
router.delete('/categories/:id', authorize('admin'), admin.deleteCategory)

router.get('/inventory', authorize('admin', 'manager', 'employee'), admin.listInventory)
router.patch(
  '/inventory/:id',
  authorize('admin', 'manager', 'employee'),
  validate({ body: inventoryUpdateSchema }),
  admin.updateInventory,
)
router.patch(
  '/inventory/:id/adjust',
  authorize('admin', 'manager', 'employee'),
  validate({ body: inventoryAdjustSchema }),
  admin.adjustInventory,
)
router.get(
  '/inventory/:id/movements',
  authorize('admin', 'manager', 'employee'),
  admin.listInventoryMovements,
)

router.get('/promotions', authorize('admin', 'manager'), admin.listPromotions)
router.post(
  '/promotions',
  authorize('admin', 'manager'),
  validate({ body: promotionSchema }),
  admin.createPromotion,
)
router.patch(
  '/promotions/:id',
  authorize('admin', 'manager'),
  validate({ body: promotionSchema.partial() }),
  admin.updatePromotion,
)
router.delete('/promotions/:id', authorize('admin'), admin.deletePromotion)

router.get('/branches', authorize('admin', 'manager'), admin.listBranches)
router.post(
  '/branches',
  authorize('admin'),
  validate({ body: branchSchema }),
  admin.createBranch,
)
router.patch(
  '/branches/:id',
  authorize('admin'),
  validate({ body: branchSchema.partial() }),
  admin.updateBranch,
)

router.get('/employees', authorize('admin'), admin.listEmployees)
router.post(
  '/employees',
  authorize('admin'),
  validate({ body: employeeCreateSchema }),
  admin.createEmployee,
)
router.patch(
  '/employees/:id',
  authorize('admin'),
  validate({ body: employeeUpdateSchema }),
  admin.updateEmployee,
)

router.get('/reviews', authorize('admin', 'manager'), admin.listReviews)
router.patch('/reviews/:id', authorize('admin', 'manager'), admin.moderateReview)

module.exports = router
