const ExcelJS = require('exceljs')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Branch = require('../models/Branch')
const Inventory = require('../models/Inventory')
const ApiError = require('../utils/ApiError')
const { slugify } = require('../utils/helpers')
const { applyInventoryMovement } = require('./inventoryMovementService')

const MAX_IMPORT_ROWS = 2000
const headerAliases = {
  sku: ['sku', 'product sku'],
  barcode: ['barcode', 'bar code'],
  name: ['product name', 'name'],
  category: ['category', 'category name'],
  price: ['price', 'price rwf'],
  quantity: ['stock quantity', 'quantity', 'qty', 'stock'],
  branch: ['branch', 'branch code', 'branch name'],
  image: ['image', 'image url', 'product image'],
}

const normalizeHeader = (value) =>
  String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

const cellText = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    if ('result' in value) return cellText(value.result)
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text || '').join('').trim()
    }
    if ('text' in value) return String(value.text || '').trim()
    return ''
  }
  return String(value).trim()
}

function parseCsv(buffer) {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (quoted) throw ApiError.badRequest('The CSV file contains an unclosed quoted field')
  row.push(field)
  if (row.some((cell) => cell.trim())) rows.push(row)
  return rows
}

async function readRows(file) {
  const extension = file.originalname.toLowerCase().split('.').pop()
  if (extension === 'csv') return parseCsv(file.buffer).map((row) => row.map(cellText))
  if (extension !== 'xlsx') {
    throw ApiError.badRequest('Upload a CSV or Excel .xlsx file')
  }

  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(file.buffer)
  } catch {
    throw ApiError.badRequest('The Excel file is invalid or could not be read')
  }
  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw ApiError.badRequest('The Excel file does not contain a worksheet')

  const rows = []
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const values = []
    row.eachCell({ includeEmpty: true }, (cell, column) => {
      values[column - 1] = cell.text || cellText(cell.value)
    })
    rows.push(values)
  })
  return rows
}

function getColumnIndexes(headers) {
  const indexes = {}
  for (const [key, aliases] of Object.entries(headerAliases)) {
    indexes[key] = headers.findIndex((header) => aliases.includes(normalizeHeader(header)))
  }

  const required = ['sku', 'barcode', 'name', 'category', 'price', 'quantity']
  const missing = required.filter((key) => indexes[key] === -1)
  if (missing.length) {
    throw ApiError.badRequest(`Missing required column(s): ${missing.join(', ')}`)
  }
  return indexes
}

function parseImportRows(rows) {
  if (rows.length < 2) throw ApiError.badRequest('The import file has no product rows')
  if (rows.length - 1 > MAX_IMPORT_ROWS) {
    throw ApiError.badRequest(`Import files may contain at most ${MAX_IMPORT_ROWS} products`)
  }

  const indexes = getColumnIndexes(rows[0])
  const records = []
  const errors = []

  rows.slice(1).forEach((row, index) => {
    const line = index + 2
    const get = (key) => (indexes[key] < 0 ? '' : cellText(row[indexes[key]]))
    const rawPrice = get('price').replace(/,/g, '')
    const rawQuantity = get('quantity').replace(/,/g, '')
    const record = {
      line,
      sku: get('sku').toUpperCase(),
      barcode: get('barcode').trim(),
      name: get('name'),
      category: get('category'),
      price: rawPrice ? Number(rawPrice) : Number.NaN,
      quantity: rawQuantity ? Number(rawQuantity) : Number.NaN,
      branch: get('branch'),
      image: get('image'),
    }

    const invalid = []
    if (!record.sku) invalid.push('SKU is required')
    if (!record.name) invalid.push('Product name is required')
    if (!record.category) invalid.push('Category is required')
    if (!Number.isFinite(record.price) || record.price < 0) invalid.push('Price must be zero or more')
    if (!Number.isInteger(record.quantity) || record.quantity < 0) {
      invalid.push('Stock quantity must be a whole number of zero or more')
    }
    if (record.name.length > 140) invalid.push('Product name must be 140 characters or fewer')
    if (record.sku.length > 60) invalid.push('SKU must be 60 characters or fewer')
    if (record.barcode.length > 60) invalid.push('Barcode must be 60 characters or fewer')
    if (
      record.image &&
      !/^https?:\/\//i.test(record.image) &&
      (!record.image.startsWith('/') || record.image.startsWith('//'))
    ) {
      invalid.push('Image must be an http(s) URL or a site-relative path')
    }
    if (invalid.length) errors.push({ row: line, message: invalid.join('; ') })
    else records.push(record)
  })

  if (errors.length) {
    throw ApiError.badRequest('Some rows contain invalid product data', errors.slice(0, 100))
  }
  return records
}

async function uniqueSlug(name, excludeId) {
  const base = slugify(name)
  let slug = base
  let suffix = 2
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

const normalizedName = (value) => String(value || '').trim().toLowerCase()

async function importProducts(file, { branchId, userId }) {
  const rows = await readRows(file)
  const records = parseImportRows(rows)
  const [categories, branches] = await Promise.all([
    Category.find({ isActive: true }),
    Branch.find({ isActive: true }),
  ])
  const categoryMap = new Map()
  categories.forEach((category) => {
    categoryMap.set(normalizedName(category.name), category)
    categoryMap.set(normalizedName(category.slug), category)
  })
  const branchMap = new Map()
  branches.forEach((branch) => {
    branchMap.set(normalizedName(branch.code), branch)
    branchMap.set(normalizedName(branch.name), branch)
  })
  const defaultBranch = branches.find((branch) => branch._id.toString() === branchId)
  if (!defaultBranch) throw ApiError.badRequest('Choose a valid active branch for the import')

  const skuBranchSet = new Set()
  const barcodeSkuMap = new Map()
  const productDetails = new Map()
  const errors = []
  const existingProducts = new Map()
  const resolved = records.map((record) => {
    const productKey = record.sku.toLowerCase()

    const category = categoryMap.get(normalizedName(record.category))
    if (!category) {
      errors.push({ row: record.line, message: `Category "${record.category}" does not exist` })
    }
    const branch = record.branch ? branchMap.get(normalizedName(record.branch)) : defaultBranch
    if (!branch) errors.push({ row: record.line, message: `Branch "${record.branch}" does not exist` })

    const stockKey = `${productKey}:${branch?._id || 'unknown'}`
    if (skuBranchSet.has(stockKey)) {
      errors.push({ row: record.line, message: 'SKU and branch are repeated in this file' })
    }
    skuBranchSet.add(stockKey)

    if (record.barcode) {
      const barcodeSku = barcodeSkuMap.get(record.barcode)
      if (barcodeSku && barcodeSku !== productKey) {
        errors.push({ row: record.line, message: 'Barcode is assigned to multiple SKUs in this file' })
      }
      barcodeSkuMap.set(record.barcode, productKey)
    }
    const details = JSON.stringify([
      record.barcode,
      record.name,
      normalizedName(record.category),
      record.price,
      record.image,
    ])
    if (productDetails.has(productKey) && productDetails.get(productKey) !== details) {
      errors.push({ row: record.line, message: 'Product details differ across branches for this SKU' })
    }
    productDetails.set(productKey, details)
    return { ...record, categoryDoc: category, branchDoc: branch }
  })

  if (errors.length) {
    throw ApiError.badRequest('Some rows could not be matched to the catalog', errors.slice(0, 100))
  }

  const [products, barcodeProducts] = await Promise.all([
    Product.find({ sku: { $in: records.map((record) => record.sku) } }),
    Product.find({
      barcode: { $in: [...new Set(records.map((record) => record.barcode).filter(Boolean))] },
    }).select('sku barcode'),
  ])
  for (const product of barcodeProducts) {
    const mappedSku = barcodeSkuMap.get(product.barcode)
    if (mappedSku && mappedSku !== product.sku.toLowerCase()) {
      errors.push({
        row: records.find((record) => record.barcode === product.barcode)?.line,
        message: `Barcode "${product.barcode}" already belongs to SKU ${product.sku}`,
      })
    }
  }
  if (errors.length) {
    throw ApiError.badRequest('Some barcodes already belong to other products', errors.slice(0, 100))
  }
  products.forEach((product) => existingProducts.set(product.sku.toUpperCase(), product))
  const productBySku = new Map(products.map((product) => [product.sku.toUpperCase(), product]))
  const branchesWithInventory = await Inventory.find({
    product: { $in: products.map((product) => product._id) },
    branch: { $in: resolved.map((record) => record.branchDoc._id) },
  })
  const inventoryMap = new Map(
    branchesWithInventory.map((row) => [`${row.product}:${row.branch}`, row]),
  )

  for (const record of resolved) {
    const product = productBySku.get(record.sku)
    const inventory = product
      ? inventoryMap.get(`${product._id}:${record.branchDoc._id}`)
      : null
    if (inventory && record.quantity < inventory.reserved) {
      errors.push({
        row: record.line,
        message: `Stock quantity cannot be below ${inventory.reserved} units already reserved`,
      })
    }
  }
  if (errors.length) {
    throw ApiError.badRequest('Some stock quantities conflict with open orders', errors.slice(0, 100))
  }

  const existingSkuSet = new Set(existingProducts.keys())
  const importedSkus = new Set()
  const updatedSkus = new Set()
  const sourceSystem = file.originalname.toLowerCase().endsWith('.xlsx')
    ? 'xlsx_import'
    : 'csv_import'

  let completedStockRows = 0
  for (const record of resolved) {
    try {
      const existing = existingProducts.get(record.sku)
      const product = existing || new Product()
      const nameChanged = !existing || existing.name !== record.name
      product.name = record.name
      product.sku = record.sku
      product.barcode = record.barcode
      product.category = record.categoryDoc._id
      product.price = record.price
      product.sourceSystem = sourceSystem
      product.isDemo = false
      if (record.image) product.images = [record.image]
      if (nameChanged) {
        product.slug = await uniqueSlug(record.name, existing?._id)
      }
      await product.save()
      existingProducts.set(record.sku, product)

      let inventory = await Inventory.findOne({
        product: product._id,
        branch: record.branchDoc._id,
      })
      if (!inventory) {
        inventory = await Inventory.create({
          product: product._id,
          branch: record.branchDoc._id,
          quantity: 0,
          reserved: 0,
        })
      }

      await applyInventoryMovement({
        inventoryId: inventory._id,
        targetQuantity: record.quantity,
        type: sourceSystem,
        source: sourceSystem,
        reason: `Catalog import from ${file.originalname}, row ${record.line}`,
        performedBy: userId,
      })
      completedStockRows += 1

      if (existingSkuSet.has(record.sku)) updatedSkus.add(record.sku)
      else importedSkus.add(record.sku)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(
          error.statusCode,
          `Import stopped at row ${record.line}. ${error.message} ${completedStockRows} stock row(s) completed before the failure; review the current row before retrying.`,
          [{ row: record.line, message: error.message }],
        )
      }
      console.error(`Catalog import failed at row ${record.line}:`, error)
      throw new ApiError(
        500,
        `Import stopped at row ${record.line}. ${completedStockRows} stock row(s) completed before the failure; review the current row before retrying.`,
        [{ row: record.line, message: 'Unexpected database or catalog error' }],
      )
    }
  }

  return {
    imported: importedSkus.size,
    updated: updatedSkus.size,
    stockRows: records.length,
  }
}

module.exports = { importProducts, parseCsv, parseImportRows, readRows }
