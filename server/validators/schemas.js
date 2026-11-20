const { z } = require('zod')

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().max(30).optional().default(''),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
})

const productQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular', 'savings'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(60).optional().default(12),
  featured: z.enum(['true', 'false']).optional(),
  offers: z.enum(['true', 'false']).optional(),
})

const cartAddSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  branchId: objectId.optional(),
})

const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
})

const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1),
  deliveryType: z.enum(['delivery', 'collection']).default('delivery'),
  substitutionPreference: z
    .enum(['ask_first', 'allow_similar', 'skip_unavailable'])
    .optional()
    .default('ask_first'),
  branchId: objectId,
  shippingAddress: z
    .object({
      line1: z.string().max(200).optional().default(''),
      city: z.string().max(80).optional().default('Kigali'),
      phone: z.string().max(30).optional().default(''),
      notes: z.string().max(300).optional().default(''),
    })
    .optional()
    .default({}),
  paymentMethod: z.enum(['mock', 'mtn_momo', 'airtel', 'card', 'cash_on_delivery']).default('mock'),
  promotionCode: z.string().max(40).optional().default(''),
  idempotencyKey: z.string().max(120).optional(),
})

const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional().default(''),
  comment: z.string().max(1000).optional().default(''),
})

const productCreateSchema = z.object({
  name: z.string().min(2).max(140),
  sku: z.string().min(2).max(60),
  description: z.string().max(2000).optional().default(''),
  category: objectId,
  brand: z.string().max(80).optional().default('Sawa Citi'),
  images: z.array(z.string()).optional().default([]),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional().default(0),
  weight: z.string().max(40).optional().default(''),
  size: z.string().max(40).optional().default(''),
  barcode: z.string().max(60).optional().default(''),
  externalId: z.string().max(120).optional().default(''),
  sourceSystem: z.enum(['manual', 'csv_import', 'xlsx_import', 'pos_api']).optional(),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  isFeatured: z.coerce.boolean().optional().default(false),
  isDemo: z.coerce.boolean().optional().default(true),
})

const productUpdateSchema = productCreateSchema.partial()

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().max(80).optional(),
  description: z.string().max(500).optional().default(''),
  image: z.string().max(400).optional().default(''),
  parent: objectId.nullable().optional().default(null),
  isActive: z.coerce.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
})

const categoryUpdateSchema = categorySchema.partial()

const inventoryUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  reason: z.string().max(300).optional().default('Manual stock count correction'),
})

const inventoryAdjustSchema = z.object({
  delta: z.coerce.number().int().min(-1000000).max(1000000),
  reason: z.string().min(1).max(300).optional().default('Manual stock adjustment'),
})

const inventoryImportSchema = z.object({
  branchId: objectId,
})

const orderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'ready',
    'out_for_delivery',
    'completed',
    'cancelled',
  ]),
  note: z.string().max(300).optional().default(''),
})

const promotionSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(40),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0),
  minSpend: z.coerce.number().min(0).optional().default(0),
  appliesTo: z.enum(['all', 'product', 'category']).optional().default('all'),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  usageLimit: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
})

const branchSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(20),
  address: z.string().max(200).optional().default(''),
  phone: z.string().max(30).optional().default(''),
  openingHours: z.string().max(80).optional().default('06:45 - 22:45'),
  supportsDelivery: z.coerce.boolean().optional().default(true),
  supportsCollection: z.coerce.boolean().optional().default(true),
  deliveryFee: z.coerce.number().min(0).optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
})

const employeeCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(['employee', 'manager', 'admin']).default('employee'),
  phone: z.string().max(30).optional().default(''),
})

const employeeUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.enum(['employee', 'manager', 'admin']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  phone: z.string().max(30).optional(),
})

const analyticsQuerySchema = z.object({
  range: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
})

module.exports = {
  objectId,
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  productQuerySchema,
  cartAddSchema,
  cartUpdateSchema,
  orderCreateSchema,
  reviewCreateSchema,
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
  analyticsQuerySchema,
}
