import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import ProductCard from '../../components/product/ProductCard'
import { useStore } from '../../context/StoreContext'
import { api, apiMessage } from '../../lib/api'
import { normalizeProducts } from '../../lib/normalize'

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (wishlist.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const collected = []
        let page = 1
        let pages = 1
        while (page <= pages && collected.length < wishlist.length) {
          const { data } = await api.get('/products', { params: { limit: 60, page } })
          collected.push(...(data.data || []))
          pages = data.pagination?.pages || 1
          page += 1
        }
        if (cancelled) return
        const matched = collected.filter((product) => wishlist.includes(product._id))
        setProducts(normalizeProducts(matched))
      } catch (requestError) {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load your wishlist'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [wishlist])

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Wishlist"
        title="Saved products"
        description="Your wishlist is stored on this device. Add items from any product card."
        actions={
          wishlist.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="btn-outline h-9 px-3 text-xs"
            >
              Clear wishlist
            </button>
          )
        }
      />

      <div className="mt-6">
        {loading ? (
          <Spinner label="Loading wishlist..." />
        ) : error ? (
          <EmptyState
            title="Could not load wishlist"
            description={error}
            action={
              <Link to="/shop" className="btn-primary">
                Browse products
              </Link>
            }
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it for later."
            action={
              <Link to="/shop" className="btn-primary">
                Find products
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
