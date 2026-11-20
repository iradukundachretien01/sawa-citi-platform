import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PackageSearch } from 'lucide-react'
import { products as demoProducts } from '../../data/demo'
import { api } from '../../lib/api'
import { normalizeProducts } from '../../lib/normalize'
import ProductCard from '../product/ProductCard'

export default function PopularProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const featured = await api.get('/products?featured=true&limit=6')
        let list = featured.data.data || []
        if (list.length < 6) {
          const all = await api.get('/products?limit=6&sort=popular')
          list = all.data.data || list
        }
        if (!cancelled) setProducts(normalizeProducts(list))
      } catch {
        if (!cancelled) setProducts(normalizeProducts(demoProducts))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="products" className="container-page mt-12 scroll-mt-28 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title">Popular Products</h2>
          <p className="mt-1 text-sm text-muted">
            Hand-picked favourites, fresh from our shelves
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          View All Products
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card h-72 animate-pulse bg-white" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-card border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
          <PackageSearch className="h-10 w-10 text-brand-400" aria-hidden="true" />
          <h3 className="mt-3 font-display text-lg font-bold text-ink">Products are on the way</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            The store catalogue could not be loaded. Please try again shortly.
          </p>
        </div>
      )}
    </section>
  )
}
