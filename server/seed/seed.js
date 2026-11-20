const bcrypt = require('bcryptjs')
const { connectDB, disconnectDB } = require('../config/db')
const User = require('../models/User')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Branch = require('../models/Branch')
const Inventory = require('../models/Inventory')
const Order = require('../models/Order')
const Delivery = require('../models/Delivery')
const Promotion = require('../models/Promotion')
const Review = require('../models/Review')
const Cart = require('../models/Cart')
const Payment = require('../models/Payment')
const Notification = require('../models/Notification')
const { generateOrderNumber } = require('../utils/helpers')

const categorySeed = [
  { name: 'Fruits', slug: 'fruits', image: '/demo/cat-fruits.jpg', sortOrder: 1 },
  { name: 'Vegetables', slug: 'vegetables', image: '/demo/cat-vegetables.jpg', sortOrder: 2 },
  { name: 'Groceries', slug: 'groceries', image: '/demo/cat-groceries.jpg', sortOrder: 3 },
  { name: 'Dairy', slug: 'dairy', image: '/demo/cat-dairy.jpg', sortOrder: 4 },
  { name: 'Drinks', slug: 'drinks', image: '/demo/cat-drinks.jpg', sortOrder: 5 },
  { name: 'Bakery', slug: 'bakery', image: '/demo/cat-bakery.jpg', sortOrder: 6 },
  { name: 'Snacks', slug: 'snacks', image: '/demo/cat-snacks.jpg', sortOrder: 7 },
  { name: 'Household', slug: 'household', image: '/demo/cat-household.jpg', sortOrder: 8 },
  { name: 'Personal Care', slug: 'personal-care', image: '/demo/cat-personal.jpg', sortOrder: 9 },
  { name: 'Meat & Fish', slug: 'meat-fish', image: '/demo/cat-meat.jpg', sortOrder: 10 },
]

const branchSeed = [
  {
    name: 'Kigali City Center',
    code: 'KGL',
    address: 'KN 4 Ave, Nyarugenge, Kigali',
    phone: '+250 788 000 111',
    deliveryFee: 1500,
  },
  {
    name: 'Kimironko',
    code: 'KMR',
    address: 'KG 11 Ave, Gasabo, Kigali',
    phone: '+250 788 000 222',
    deliveryFee: 1000,
  },
  {
    name: 'Remera',
    code: 'RMR',
    address: 'KG 9 Ave, Gasabo, Kigali',
    phone: '+250 788 000 333',
    deliveryFee: 1200,
  },
]

const productSeed = [
  { name: 'Bananas', sku: 'FRU-BAN-001', categorySlug: 'fruits', price: 1800, discountPrice: 1500, weight: '1 kg bunch', images: ['/demo/p-bananas.jpg'], isFeatured: true, avgRating: 4.7, reviewCount: 24, tags: ['fresh', 'fruit'] },
  { name: 'Apples', sku: 'FRU-APP-002', categorySlug: 'fruits', price: 2000, weight: '1 kg', images: ['/demo/p-apples.jpg'], isFeatured: true, avgRating: 4.6, reviewCount: 18, tags: ['fresh', 'fruit'] },
  { name: 'Oranges', sku: 'FRU-ORA-003', categorySlug: 'fruits', price: 2200, weight: '1 kg', images: ['/demo/cat-fruits.jpg'], avgRating: 4.4, reviewCount: 11, tags: ['citrus', 'fruit'] },
  { name: 'Pineapple', sku: 'FRU-PIN-004', categorySlug: 'fruits', price: 2500, weight: '1 piece', images: ['/demo/cat-fruits.jpg'], avgRating: 4.5, reviewCount: 9, tags: ['tropical', 'fruit'] },
  { name: 'Tomatoes', sku: 'VEG-TOM-001', categorySlug: 'vegetables', price: 2000, discountPrice: 1800, weight: '250 g', images: ['/demo/p-tomatoes.jpg'], isFeatured: true, avgRating: 4.5, reviewCount: 21, tags: ['fresh', 'vegetable'] },
  { name: 'Onions', sku: 'VEG-ONI-002', categorySlug: 'vegetables', price: 1200, weight: '1 kg', images: ['/demo/cat-vegetables.jpg'], avgRating: 4.3, reviewCount: 14, tags: ['vegetable'] },
  { name: 'Carrots', sku: 'VEG-CAR-003', categorySlug: 'vegetables', price: 1500, weight: '1 kg', images: ['/demo/cat-vegetables.jpg'], avgRating: 4.4, reviewCount: 12, tags: ['vegetable'] },
  { name: 'Spinach', sku: 'VEG-SPI-004', categorySlug: 'vegetables', price: 1000, weight: '1 bunch', images: ['/demo/cat-vegetables.jpg'], avgRating: 4.2, reviewCount: 7, tags: ['greens'] },
  { name: 'Cooking Oil 1L', sku: 'GRO-OIL-001', categorySlug: 'groceries', price: 4600, discountPrice: 4000, size: '1 litre', images: ['/demo/p-cooking-oil.jpg'], isFeatured: true, avgRating: 4.4, reviewCount: 32, tags: ['cooking', 'oil'] },
  { name: 'Rice 5kg', sku: 'GRO-RIC-002', categorySlug: 'groceries', price: 3500, weight: '5 kg bag', images: ['/demo/p-rice.jpg'], isFeatured: true, avgRating: 4.6, reviewCount: 27, tags: ['rice', 'staple'] },
  { name: 'Sugar 1kg', sku: 'GRO-SUG-003', categorySlug: 'groceries', price: 1600, weight: '1 kg', images: ['/demo/cat-groceries.jpg'], avgRating: 4.3, reviewCount: 15, tags: ['sugar'] },
  { name: 'Salt 500g', sku: 'GRO-SAL-004', categorySlug: 'groceries', price: 500, weight: '500 g', images: ['/demo/cat-groceries.jpg'], avgRating: 4.1, reviewCount: 6, tags: ['salt'] },
  { name: 'Beans 1kg', sku: 'GRO-BEA-005', categorySlug: 'groceries', price: 1800, weight: '1 kg', images: ['/demo/cat-groceries.jpg'], avgRating: 4.5, reviewCount: 13, tags: ['beans', 'staple'] },
  { name: 'Milk 1L', sku: 'DAI-MIL-001', categorySlug: 'dairy', price: 2500, size: '1 litre', images: ['/demo/p-milk.jpg'], isFeatured: true, avgRating: 4.8, reviewCount: 40, tags: ['milk', 'fresh'] },
  { name: 'Eggs', sku: 'DAI-EGG-002', categorySlug: 'dairy', price: 3400, discountPrice: 3000, size: 'Tray of 30', images: ['/demo/p-eggs.jpg'], isFeatured: true, avgRating: 4.7, reviewCount: 29, tags: ['eggs', 'protein'] },
  { name: 'Yoghurt 500ml', sku: 'DAI-YOG-003', categorySlug: 'dairy', price: 2000, size: '500 ml', images: ['/demo/cat-dairy.jpg'], avgRating: 4.5, reviewCount: 16, tags: ['yoghurt'] },
  { name: 'Cheese 250g', sku: 'DAI-CHE-004', categorySlug: 'dairy', price: 4500, weight: '250 g', images: ['/demo/cat-dairy.jpg'], avgRating: 4.6, reviewCount: 8, tags: ['cheese'] },
  { name: 'Water 1.5L', sku: 'DRI-WAT-001', categorySlug: 'drinks', price: 700, size: '1.5 litre', images: ['/demo/cat-drinks.jpg'], avgRating: 4.4, reviewCount: 22, tags: ['water'] },
  { name: 'Soda 500ml', sku: 'DRI-SOD-002', categorySlug: 'drinks', price: 800, size: '500 ml', images: ['/demo/cat-drinks.jpg'], avgRating: 4.2, reviewCount: 19, tags: ['soft drink'] },
  { name: 'Juice 1L', sku: 'DRI-JUI-003', categorySlug: 'drinks', price: 2800, size: '1 litre', images: ['/demo/cat-drinks.jpg'], avgRating: 4.5, reviewCount: 12, tags: ['juice'] },
  { name: 'Bread', sku: 'BAK-BRE-001', categorySlug: 'bakery', price: 1000, weight: '500 g loaf', images: ['/demo/p-bread.jpg'], isFeatured: true, avgRating: 4.9, reviewCount: 35, tags: ['bread', 'fresh'] },
  { name: 'Croissant', sku: 'BAK-CRO-002', categorySlug: 'bakery', price: 1200, weight: '2 pieces', images: ['/demo/cat-bakery.jpg'], avgRating: 4.6, reviewCount: 10, tags: ['pastry'] },
  { name: 'Birthday Cake', sku: 'BAK-CAK-003', categorySlug: 'bakery', price: 18000, weight: '1 kg', images: ['/demo/cat-bakery.jpg'], avgRating: 4.8, reviewCount: 5, tags: ['cake', 'celebration'] },
  { name: 'Biscuits', sku: 'SNA-BIS-001', categorySlug: 'snacks', price: 900, weight: '200 g', images: ['/demo/cat-snacks.jpg'], avgRating: 4.3, reviewCount: 14, tags: ['snack'] },
  { name: 'Crisps', sku: 'SNA-CRI-002', categorySlug: 'snacks', price: 1200, weight: '150 g', images: ['/demo/cat-snacks.jpg'], avgRating: 4.2, reviewCount: 11, tags: ['snack'] },
  { name: 'Chocolate Bar', sku: 'SNA-CHO-003', categorySlug: 'snacks', price: 1500, weight: '100 g', images: ['/demo/cat-snacks.jpg'], avgRating: 4.6, reviewCount: 17, tags: ['chocolate'] },
  { name: 'Laundry Detergent', sku: 'HOU-DET-001', categorySlug: 'household', price: 3500, size: '1 kg', images: ['/demo/cat-household.jpg'], avgRating: 4.4, reviewCount: 20, tags: ['cleaning'] },
  { name: 'Dish Soap', sku: 'HOU-DIS-002', categorySlug: 'household', price: 1800, size: '500 ml', images: ['/demo/cat-household.jpg'], avgRating: 4.3, reviewCount: 13, tags: ['cleaning'] },
  { name: 'Tissue Pack', sku: 'HOU-TIS-003', categorySlug: 'household', price: 2200, weight: '4 rolls', images: ['/demo/cat-household.jpg'], avgRating: 4.5, reviewCount: 9, tags: ['tissue'] },
  { name: 'Bath Soap', sku: 'PER-SOA-001', categorySlug: 'personal-care', price: 800, weight: '150 g', images: ['/demo/cat-personal.jpg'], avgRating: 4.3, reviewCount: 16, tags: ['soap'] },
  { name: 'Toothpaste', sku: 'PER-TOO-002', categorySlug: 'personal-care', price: 1500, size: '100 ml', images: ['/demo/cat-personal.jpg'], avgRating: 4.5, reviewCount: 12, tags: ['dental'] },
  { name: 'Shampoo', sku: 'PER-SHA-003', categorySlug: 'personal-care', price: 3200, size: '400 ml', images: ['/demo/cat-personal.jpg'], avgRating: 4.4, reviewCount: 8, tags: ['hair'] },
  { name: 'Chicken 1kg', sku: 'MEA-CHI-001', categorySlug: 'meat-fish', price: 6500, weight: '1 kg', images: ['/demo/cat-meat.jpg'], avgRating: 4.6, reviewCount: 15, tags: ['meat', 'protein'] },
  { name: 'Tilapia', sku: 'MEA-TIL-002', categorySlug: 'meat-fish', price: 5500, weight: '1 kg', images: ['/demo/cat-meat.jpg'], avgRating: 4.5, reviewCount: 10, tags: ['fish', 'protein'] },
  { name: 'Beef 1kg', sku: 'MEA-BEE-003', categorySlug: 'meat-fish', price: 8000, weight: '1 kg', images: ['/demo/cat-meat.jpg'], avgRating: 4.7, reviewCount: 12, tags: ['meat', 'protein'] },
]

async function seedDemoData({ force = false } = {}) {
  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Branch.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
      Delivery.deleteMany({}),
      Promotion.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ])
  } else if ((await User.estimatedDocumentCount()) > 0) {
    console.log('Seed skipped: data already exists.')
    return
  }

  const [adminHash, managerHash, employeeHash, customerHash] = await Promise.all([
    bcrypt.hash('Admin@1234', 12),
    bcrypt.hash('Manager@1234', 12),
    bcrypt.hash('Employee@1234', 12),
    bcrypt.hash('Customer@1234', 12),
  ])

  const users = await User.create([
    {
      name: 'Sawa Admin',
      email: 'admin@sawaciti.test',
      phone: '+250 788 111 222',
      passwordHash: adminHash,
      role: 'admin',
    },
    {
      name: 'Store Manager',
      email: 'manager@sawaciti.test',
      phone: '+250 788 111 333',
      passwordHash: managerHash,
      role: 'manager',
    },
    {
      name: 'Store Attendant',
      email: 'employee@sawaciti.test',
      phone: '+250 788 111 444',
      passwordHash: employeeHash,
      role: 'employee',
    },
    {
      name: 'Aline Uwase',
      email: 'customer@sawaciti.test',
      phone: '+250 788 555 666',
      passwordHash: customerHash,
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          line1: 'KG 15 Ave, House 12',
          city: 'Kigali',
          phone: '+250 788 555 666',
          isDefault: true,
        },
      ],
    },
  ])

  const customer = users.find((user) => user.role === 'customer')

  const categories = await Category.create(categorySeed)
  const categoryMap = new Map(categories.map((category) => [category.slug, category._id]))

  const products = await Product.create(
    productSeed.map((product) => ({
      name: product.name,
      slug: product.sku.toLowerCase(),
      sku: product.sku,
      description: `${product.name} — quality checked and packed by Sawa Citi. DEMO DATA — not real inventory.`,
      category: categoryMap.get(product.categorySlug),
      brand: 'Sawa Citi',
      images: product.images,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      weight: product.weight || '',
      size: product.size || '',
      tags: product.tags || [],
      isFeatured: Boolean(product.isFeatured),
      avgRating: product.avgRating || 0,
      reviewCount: product.reviewCount || 0,
      isDemo: true,
      status: 'active',
    })),
  )

  const branches = await Branch.create(branchSeed)

  const inventory = []
  products.forEach((product, productIndex) => {
    branches.forEach((branch, branchIndex) => {
      const base = 18 + ((productIndex * 9 + branchIndex * 7) % 45)
      const quantity = branchIndex === 2 ? Math.max(0, base - 30) : base
      inventory.push({
        product: product._id,
        branch: branch._id,
        quantity,
        reserved: 0,
        lowStockThreshold: 10,
      })
    })
  })
  await Inventory.insertMany(inventory)

  await Promotion.create([
    {
      name: 'Welcome 10% off',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minSpend: 5000,
      startsAt: new Date(Date.now() - 86400000),
      endsAt: null,
      usageLimit: 0,
      isActive: true,
    },
    {
      name: 'Fresh 500 off',
      code: 'FRESH500',
      type: 'fixed',
      value: 500,
      minSpend: 3000,
      startsAt: new Date(Date.now() - 86400000),
      endsAt: null,
      usageLimit: 0,
      isActive: true,
    },
  ])

  const findBySku = (sku) => products.find((product) => product.sku === sku)

  await Review.create([
    {
      product: findBySku('FRU-BAN-001')._id,
      user: customer._id,
      rating: 5,
      title: 'Very fresh',
      comment: 'The bananas arrived ripe and sweet. Great value.',
      status: 'approved',
    },
    {
      product: findBySku('DAI-MIL-001')._id,
      user: customer._id,
      rating: 5,
      title: 'Fresh milk',
      comment: 'Delivered cold in the morning. Will order again.',
      status: 'approved',
    },
    {
      product: findBySku('BAK-BRE-001')._id,
      user: customer._id,
      rating: 4,
      title: 'Good daily bread',
      comment: 'Soft and fresh. Packaging could be better.',
      status: 'approved',
    },
  ])

  customer.wishlist = [findBySku('FRU-APP-002')._id, findBySku('GRO-RIC-002')._id]
  await customer.save()

  const branch = branches[0]

  const buildItems = (entries) =>
    entries.map(([sku, quantity]) => {
      const product = findBySku(sku)
      const unitPrice =
        product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price
      return {
        product: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || '',
        unit: product.size || product.weight || '',
        price: unitPrice,
        quantity,
        subtotal: unitPrice * quantity,
      }
    })

  const sampleOrders = [
    {
      daysAgo: 9,
      status: 'completed',
      entries: [
        ['GRO-RIC-002', 2],
        ['GRO-OIL-001', 1],
        ['DAI-MIL-001', 2],
      ],
    },
    {
      daysAgo: 5,
      status: 'completed',
      entries: [
        ['FRU-BAN-001', 3],
        ['BAK-BRE-001', 2],
        ['DAI-EGG-002', 1],
      ],
    },
    {
      daysAgo: 2,
      status: 'processing',
      entries: [
        ['MEA-CHI-001', 1],
        ['VEG-TOM-001', 2],
        ['DRI-WAT-001', 4],
      ],
    },
  ]

  for (const sample of sampleOrders) {
    const items = buildItems(sample.entries)
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const deliveryFee = branch.deliveryFee
    const total = subtotal + deliveryFee

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: customer._id,
      items,
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      paymentMethod: 'mock',
      paymentStatus: 'paid',
      orderStatus: sample.status,
      deliveryType: 'delivery',
      branch: branch._id,
      shippingAddress: {
        line1: 'KG 15 Ave, House 12',
        city: 'Kigali',
        phone: customer.phone,
        notes: '',
      },
      statusHistory: [
        { status: 'pending', note: 'Order placed', at: new Date(Date.now() - sample.daysAgo * 86400000) },
        { status: sample.status, note: 'Updated by store', at: new Date(Date.now() - (sample.daysAgo - 1) * 86400000) },
      ],
    })

    const createdAt = new Date(Date.now() - sample.daysAgo * 86400000)
    await Order.updateOne({ _id: order._id }, { $set: { createdAt } })

    await Delivery.create({
      order: order._id,
      method: 'delivery',
      fee: deliveryFee,
      trackingEvents: [
        { status: 'pending', note: 'Order received' },
        { status: sample.status, note: 'Demo tracking event' },
      ],
    })

    await Promise.all(
      items.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { soldCount: item.quantity } }),
      ),
    )
  }

  console.log('Seed complete.')
  console.log('Demo logins:')
  console.log('  admin@sawaciti.test / Admin@1234')
  console.log('  manager@sawaciti.test / Manager@1234')
  console.log('  employee@sawaciti.test / Employee@1234')
  console.log('  customer@sawaciti.test / Customer@1234')
}

if (require.main === module) {
  ;(async () => {
    await connectDB()
    await seedDemoData({ force: process.argv.includes('--force') })
    await disconnectDB()
    process.exit(0)
  })().catch(async (error) => {
    console.error('Seed failed:', error)
    await disconnectDB().catch(() => {})
    process.exit(1)
  })
}

module.exports = { seedDemoData }
