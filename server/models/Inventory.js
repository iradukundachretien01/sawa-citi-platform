const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    quantity: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
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

inventorySchema.virtual('available').get(function available() {
  return Math.max(0, this.quantity - this.reserved)
})

inventorySchema.virtual('stockStatus').get(function stockStatus() {
  const available = Math.max(0, this.quantity - this.reserved)
  if (available <= 0) return 'out_of_stock'
  if (available <= this.lowStockThreshold) return 'low_stock'
  return 'in_stock'
})

inventorySchema.index({ product: 1, branch: 1 }, { unique: true })

module.exports = mongoose.model('Inventory', inventorySchema)
