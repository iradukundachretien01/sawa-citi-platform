const mongoose = require('mongoose')

const webhookLogSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false },
)

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: {
      type: String,
      enum: ['mock', 'mtn_momo', 'airtel', 'card', 'cash_on_delivery'],
      default: 'mock',
    },
    method: {
      type: String,
      enum: ['mock', 'mtn_momo', 'airtel', 'card', 'cash_on_delivery'],
      default: 'mock',
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'RWF' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    providerRef: { type: String, default: '' },
    paidAt: { type: Date, default: null },
    failureReason: { type: String, default: '' },
    webhookToken: { type: String, default: '' },
    idempotencyKey: { type: String, default: undefined },
    webhookLog: [webhookLogSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v
        delete ret.webhookToken
        return ret
      },
    },
  },
)

paymentSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true })
paymentSchema.index({ order: 1, status: 1 })
paymentSchema.index({ providerRef: 1 }, { sparse: true })

module.exports = mongoose.model('Payment', paymentSchema)
