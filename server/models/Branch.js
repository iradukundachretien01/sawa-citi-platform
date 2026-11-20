const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    openingHours: { type: String, default: '06:45 - 22:45' },
    geo: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    supportsDelivery: { type: Boolean, default: true },
    supportsCollection: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
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

module.exports = mongoose.model('Branch', branchSchema)
