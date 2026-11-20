import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import BackButton from '../../components/common/BackButton'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useStore } from '../../context/StoreContext'
import { api, apiMessage } from '../../lib/api'
import { formatDate, normalizeProduct, normalizeProducts } from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

export default function ProductPage() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { wishlist, toggleWishlist } = useStore()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [reviewNotice, setReviewNotice] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/products/${slug}`)
        if (cancelled) return
        const raw = data.data
        setProduct(raw)
        setActiveImage(raw.images?.[0] || '/demo/hero.jpg')

        const [reviewResponse, relatedResponse] = await Promise.all([
          api.get(`/reviews/product/${raw._id}`).catch(() => ({ data: { data: [] } })),
          api.get(`/products/${raw._id}/related`).catch(() => ({ data: { data: [] } })),
        ])
        if (cancelled) return
        setReviews(reviewResponse.data.data || [])
        setRelated(normalizeProducts(relatedResponse.data.data || []))
      } catch (requestError) {
        if (!cancelled) setError(apiMessage(requestError, 'Product not found'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container-page py-10">
        <Spinner label="Loading product..." />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Product not available"
          description={error || 'This product may have been removed.'}
          action={<BackButton fallbackTo="/shop" label="Back to shop" />}
        />
      </div>
    )
  }

  const view = normalizeProduct(product)
  const inventory = product.inventory || []
  const totalAvailable = inventory.reduce((sum, row) => sum + (row.available || 0), 0)
  const branchWithStock = inventory.find((row) => (row.available || 0) > 0)
  const saved = wishlist.includes(view.id)
  const images = product.images?.length ? product.images : [view.image]

  const addToCart = () => addItem(product, quantity)
  const buyNow = () => {
    addItem(product, quantity)
    navigate('/checkout')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setReviewError('')
    setReviewNotice('')
    setSubmittingReview(true)
    try {
      const { data } = await api.post(`/reviews/product/${product._id}`, reviewForm)
      setReviews((current) => [data.data, ...current])
      setReviewNotice('Thank you! Your review has been published.')
      setReviewForm({ rating: 5, title: '', comment: '' })
    } catch (requestError) {
      setReviewError(apiMessage(requestError, 'Could not submit your review'))
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <BackButton fallbackTo="/shop" label="Back to shop" className="mt-2" />

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-card border border-black/5 bg-white shadow-soft">
            <img
              src={activeImage}
              alt={view.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === image ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {view.categoryName && (
              <Link
                to={`/shop?category=${view.category}`}
                className="rounded-pill bg-brand-50 px-2.5 py-1 font-semibold text-brand-700"
              >
                {view.categoryName}
              </Link>
            )}
            <span className="text-muted">SKU: {view.sku || '—'}</span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {view.name}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <Star className="h-4 w-4 fill-accent-400 text-accent-400" aria-hidden="true" />
            <span className="font-semibold text-ink">
              {view.rating > 0 ? view.rating.toFixed(1) : 'New'}
            </span>
            <span>· {view.reviewCount} review(s)</span>
            {view.unit && <span>· {view.unit}</span>}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-brand-700">
              {formatRwf(view.price)}
            </span>
            {view.oldPrice && (
              <span className="text-base font-medium text-muted/60 line-through">
                {formatRwf(view.oldPrice)}
              </span>
            )}
            {view.badge && (
              <span className="rounded-pill bg-accent-400 px-2.5 py-1 text-[11px] font-bold text-brand-900">
                {view.badge}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {view.description ||
              'Quality checked and packed by Sawa Citi. Prices and availability are verified on the server at checkout.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {totalAvailable > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-3 py-1.5 font-semibold text-brand-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                In stock{branchWithStock ? ` at ${branchWithStock.branch?.name}` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-red-50 px-3 py-1.5 font-semibold text-red-600">
                Out of stock
              </span>
            )}
            <span className="text-muted">Available across {inventory.length} branch(es)</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-pill border border-black/10 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-brand-50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-9 text-center text-sm font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-brand-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={addToCart}
              disabled={totalAvailable === 0}
              className="btn-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Add to cart
            </button>

            <button
              type="button"
              onClick={buyNow}
              disabled={totalAvailable === 0}
              className="btn-accent px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy now
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(view.id)}
              className={`icon-btn border ${
                saved ? 'border-brand-200 text-brand-600' : 'border-black/10 text-ink/60'
              }`}
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={saved}
            >
              <Heart className={`h-5 w-5 ${saved ? 'fill-brand-600' : ''}`} />
            </button>
          </div>

          <div className="mt-5 grid gap-2 text-xs text-muted sm:grid-cols-3">
            <span className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
              <Truck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Delivery or collection
            </span>
            <span className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Secure checkout
            </span>
            <span className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Freshness checked
            </span>
          </div>
        </div>
      </div>

      {inventory.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-ink">Branch availability</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {inventory.map((row) => (
              <div
                key={row.branch?._id || row.branch?.code}
                className="card flex items-center justify-between p-3.5 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{row.branch?.name}</p>
                  <p className="text-xs text-muted">{row.branch?.address || 'Kigali'}</p>
                </div>
                <span
                  className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                    row.available > 0
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {row.available > 0 ? `${row.available} available` : 'Out of stock'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink">Customer reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No reviews yet. Be the first to review this product.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li key={review._id} className="rounded-xl border border-black/5 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{review.user?.name || 'Customer'}</p>
                    <span className="text-[11px] text-muted">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-3.5 w-3.5 ${
                          index < review.rating
                            ? 'fill-accent-400 text-accent-400'
                            : 'text-black/15'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  {review.title && <p className="mt-1.5 text-sm font-semibold text-ink">{review.title}</p>}
                  {review.comment && <p className="mt-1 text-sm text-muted">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink">Write a review</h2>
          {user ? (
            <form onSubmit={submitReview} className="mt-3 space-y-3">
              <div>
                <label htmlFor="rating" className="text-xs font-semibold text-muted">
                  Rating
                </label>
                <select
                  id="rating"
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="review-title" className="text-xs font-semibold text-muted">
                  Title
                </label>
                <input
                  id="review-title"
                  value={reviewForm.title}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="Summarise your experience"
                  maxLength={120}
                />
              </div>
              <div>
                <label htmlFor="review-comment" className="text-xs font-semibold text-muted">
                  Comment
                </label>
                <textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, comment: event.target.value }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  placeholder="What did you like or dislike?"
                  maxLength={1000}
                />
              </div>
              {reviewError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {reviewError}
                </p>
              )}
              {reviewNotice && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                  {reviewNotice}
                </p>
              )}
              <button type="submit" disabled={submittingReview} className="btn-primary w-full py-3">
                {submittingReview ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          ) : (
            <div className="mt-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              <p>Sign in to leave a review and save your favourite products.</p>
              <Link
                to="/login"
                state={{ from: `${location.pathname}${location.search}` }}
                className="btn-primary mt-3"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="section-title">You may also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
