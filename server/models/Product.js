const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: 'Sawa Citi' },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    weight: { type: String, default: '' },
    size: { type: String, default: '' },
    barcode: { type: String, default: '', trim: true },
    externalId: { type: String, default: '', trim: true },
    sourceSystem: {
      type: String,
      enum: ['manual', 'csv_import', 'xlsx_import', 'pos_api'],
      default: 'manual',
    },
    tags: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDemo: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
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

productSchema.virtual('effectivePrice').get(function effectivePrice() {
  if (this.discountPrice && this.discountPrice > 0 && this.discountPrice < this.price) {
    return this.discountPrice
  }
  return this.price
})

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' })
productSchema.index({ barcode: 1 })
productSchema.index({ sourceSystem: 1, externalId: 1 })

module.exports = mongoose.model('Product', productSchema)
