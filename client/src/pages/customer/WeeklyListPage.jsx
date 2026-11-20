import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, ShoppingCart, Trash2 } from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import ProductCard from '../../components/product/ProductCard'
import { useCart } from '../../context/CartContext'
import { useStore } from '../../context/StoreContext'
import { api, apiMessage } from '../../lib/api'
import { normalizeProducts } from '../../lib/normalize'

export default function WeeklyListPage() {
  const { weeklyList, clearWeeklyList } = useStore()
  const { addItem } = useCart()
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get('/products', { params: { limit: 60 } })
      .then(({ data }) => {
        if (!cancelled) setCatalog(normalizeProducts(data.data))
      })
      .catch((requestError) => {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load your saved products'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const products = useMemo(
    () =>
      catalog.filter(
        (product) => weeklyList.includes(product.id) || weeklyList.includes(product.slug),
      ),
    [catalog, weeklyList],
  )

  const addAllToCart = () => products.forEach((product) => addItem(product))

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Your shopping"
        title="Weekly shopping list"
        description="Save the groceries you buy often, then add your whole list to the cart when it is time to shop."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addAllToCart}
              disabled={products.length === 0}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Add all to cart
            </button>
            {weeklyList.length > 0 && (
              <button
                type="button"
                onClick={clearWeeklyList}
                className="btn-outline"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear list
              </button>
            )}
          </div>
        }
      />

      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6">
          <Spinner label="Loading your weekly list..." />
        </div>
      ) : products.length > 0 ? (
        <>
          <p className="mt-5 text-sm text-muted">
            {products.length} {products.length === 1 ? 'product' : 'products'} saved
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : weeklyList.length > 0 && !error ? (
        <EmptyState
          icon={ClipboardList}
          title="Saved products are unavailable"
          description="Some items may no longer be in the current catalogue. Browse the shop to add available products."
          action={
            <Link to="/shop" className="btn-primary">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="Start your weekly list"
            description="Save products from the shop and they will be here next time you visit."
            action={
              <Link to="/shop" className="btn-primary">
                Browse products
              </Link>
            }
          />
        </div>
      )}
    </div>
  )
}
