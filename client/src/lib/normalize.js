export const normalizeProduct = (product) => {
  if (!product) return null

  const basePrice = Number(product.price) || 0
  const discount = Number(product.discountPrice) || 0
  const price = discount > 0 && discount < basePrice ? discount : basePrice
  const oldPrice = price !== basePrice ? basePrice : null
  const discountPercent = oldPrice ? Math.round(((basePrice - price) / basePrice) * 100) : 0

  return {
    id: product._id || product.id,
    slug: product.slug || product.id,
    name: product.name,
    price,
    oldPrice,
    savingsAmount: oldPrice ? basePrice - price : 0,
    discountPercent,
    unit: product.size || product.weight || product.unit || '',
    image: product.images?.[0] || product.image || '/demo/hero.jpg',
    images: product.images?.length ? product.images : product.image ? [product.image] : [],
    category: product.category?.slug || product.category || '',
    categoryName: product.category?.name || '',
    rating: Number(product.avgRating ?? product.rating ?? 0),
    reviewCount: product.reviewCount ?? 0,
    badge: product.badge ?? (discountPercent > 0 ? `-${discountPercent}%` : null),
    description: product.description || '',
    sku: product.sku || '',
    status: product.status || 'active',
    isFeatured: Boolean(product.isFeatured),
    soldCount: product.soldCount || 0,
  }
}

export const normalizeProducts = (products = []) => products.map(normalizeProduct)

export const orderStatusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const paymentStatusLabels = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const paymentMethodLabels = {
  mock: 'Test payment',
  mtn_momo: 'MTN Mobile Money',
  airtel: 'Airtel Money',
  card: 'Card',
  cash_on_delivery: 'Cash on delivery',
}

export const substitutionPreferenceLabels = {
  ask_first: 'Contact me before substituting',
  allow_similar: 'Allow similar substitutions',
  skip_unavailable: 'Skip unavailable items',
}

export const formatDate = (value, withTime = false) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-RW', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(new Date(value))
}
