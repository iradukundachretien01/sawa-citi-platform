const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    image: { type: String, default: '' },
    unit: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['mock', 'mtn_momo', 'airtel', 'card', 'cash_on_delivery'],
      default: 'mock',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'ready',
        'out_for_delivery',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    deliveryType: { type: String, enum: ['delivery', 'collection'], default: 'delivery' },
    substitutionPreference: {
      type: String,
      enum: ['ask_first', 'allow_similar', 'skip_unavailable'],
      default: 'ask_first',
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    shippingAddress: {
      line1: { type: String, default: '' },
      city: { type: String, default: 'Kigali' },
      phone: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    statusHistory: [statusEventSchema],
    promotionCode: { type: String, default: '' },
    idempotencyKey: { type: String, default: undefined },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v
        return ret
      },
    },
  },
)

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Order', orderSchema)
