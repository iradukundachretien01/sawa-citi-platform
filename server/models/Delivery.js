const mongoose = require('mongoose')

const trackingEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
)

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    method: { type: String, enum: ['delivery', 'collection'], default: 'delivery' },
    courier: { type: String, default: '' },
    fee: { type: Number, default: 0, min: 0 },
    scheduledAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    trackingEvents: [trackingEventSchema],
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

module.exports = mongoose.model('Delivery', deliverySchema)
