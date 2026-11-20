process.env.NODE_ENV = 'test'
process.env.MONGO_URI = ''
delete process.env.CLIENT_URL
process.env.JWT_ACCESS_SECRET = 'test-access-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'

const request = require('supertest')
const ExcelJS = require('exceljs')
const app = require('./app')
const { orderCreateSchema, productQuerySchema } = require('./validators/schemas')
const { parseCsv, parseImportRows, readRows } = require('./services/catalogImportService')

describe('Sawa Citi API', () => {
  test('reports health', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.data.status).toBe('ok')
  })

  test('reports payment methods without exposing provider credentials', async () => {
    const response = await request(app).get('/api/payments/config')

    expect(response.status).toBe(200)
    expect(response.body.data.mode).toBe('test')
    expect(response.body.data.methods.find((method) => method.value === 'cash_on_delivery')).toMatchObject({
      available: true,
      test: false,
    })
    expect(JSON.stringify(response.body)).not.toMatch(/MOMO|SUBSCRIPTION|API_KEY|TOKEN/)
  })

  test('accepts the savings product sort', () => {
    expect(productQuerySchema.parse({ sort: 'savings' }).sort).toBe('savings')
  })

  test('allows the Vite loopback origin', async () => {
    const preflight = await request(app)
      .options('/api/products')
      .set('Origin', 'http://127.0.0.1:5173')
      .set('Access-Control-Request-Method', 'GET')

    expect(preflight.status).toBe(204)
    expect(preflight.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173')
  })

  test('validates catalog query parameters', async () => {
    const response = await request(app).get('/api/products?sort=unknown')

    expect(response.status).toBe(400)
  })

  test('defaults new orders to asking before substitutions', () => {
    const parsed = orderCreateSchema.parse({
      items: [{ productId: '0123456789abcdef01234567', quantity: 1 }],
      branchId: '0123456789abcdef01234567',
    })

    expect(parsed.substitutionPreference).toBe('ask_first')
  })

  test('rejects unknown substitution preferences', () => {
    const parsed = orderCreateSchema.safeParse({
      items: [{ productId: '0123456789abcdef01234567', quantity: 1 }],
      branchId: '0123456789abcdef01234567',
      substitutionPreference: 'replace_everything',
    })

    expect(parsed.success).toBe(false)
  })

  test('parses quoted CSV product rows and required inventory fields', () => {
    const rows = parseCsv(
      Buffer.from(
        'SKU,Barcode,Product Name,Category,Price RWF,Stock Quantity,Branch Code\r\n' +
          '"MILK-01","123","Fresh, whole milk","Dairy","1,250",12,"KGL-01"\r\n',
      ),
    )
    const [product] = parseImportRows(rows)

    expect(product).toMatchObject({
      sku: 'MILK-01',
      barcode: '123',
      name: 'Fresh, whole milk',
      category: 'Dairy',
      price: 1250,
      quantity: 12,
      branch: 'KGL-01',
    })
  })

  test('reads product rows from an Excel workbook', async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Products')
    worksheet.addRow([
      'SKU',
      'Barcode',
      'Product Name',
      'Category',
      'Price RWF',
      'Stock Quantity',
    ])
    worksheet.addRow(['RICE-01', '456', 'Rice 1 kg', 'Groceries', 2000, 8])
    const file = {
      originalname: 'catalog.xlsx',
      buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
    }

    const rows = await readRows(file)
    const [product] = parseImportRows(rows)
    expect(product).toMatchObject({ sku: 'RICE-01', price: 2000, quantity: 8 })
  })

  test('protects management endpoints', async () => {
    const response = await request(app).get('/api/admin/dashboard')

    expect(response.status).toBe(401)
  })

  test('protects catalog import from unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/admin/products/import')
      .field('branchId', '0123456789abcdef01234567')

    expect(response.status).toBe(401)
  })
})
