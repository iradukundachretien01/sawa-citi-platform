const mongoose = require('mongoose')

const inventoryMovementSchema = new mongoose.Schema(
  {
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    type: {
      type: String,
      enum: [
        'adjustment',
        'csv_import',
        'xlsx_import',
        'reservation',
        'reservation_released',
        'sale',
        'order_cancelled',
      ],
      required: true,
    },
    source: {
      type: String,
      enum: ['admin', 'csv_import', 'xlsx_import', 'order', 'system', 'pos_api'],
      required: true,
    },
    quantityBefore: { type: Number, required: true },
    quantityDelta: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    reservedBefore: { type: Number, required: true },
    reservedDelta: { type: Number, required: true },
    reservedAfter: { type: Number, required: true },
    reason: { type: String, default: '' },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['pending', 'completed', 'conflict'],
      default: 'pending',
    },
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

inventoryMovementSchema.index({ inventory: 1, createdAt: -1 })
inventoryMovementSchema.index({ product: 1, branch: 1, createdAt: -1 })

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema)
