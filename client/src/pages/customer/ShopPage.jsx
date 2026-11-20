import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, Tag, X } from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import ProductCard from '../../components/product/ProductCard'
import { useCategories } from '../../hooks/useCategories'
import { api, apiMessage } from '../../lib/api'
import { normalizeProducts } from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'savings', label: 'Biggest savings first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

const budgetOptions = [2000, 5000, 10000, 25000]

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const { categories } = useCategories()

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'
  const offers = params.get('offers') === 'true'
  const maxPrice = params.get('maxPrice') || ''
  const page = Number(params.get('page')) || 1

  const [term, setTerm] = useState(q)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => setTerm(q), [q])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const query = { limit: 12, page, sort }
        if (q) query.q = q
        if (category) query.category = category
        if (offers) query.offers = 'true'
        if (maxPrice) query.maxPrice = maxPrice

        const { data } = await api.get('/products', { params: query })
        if (cancelled) return
        setProducts(normalizeProducts(data.data))
        setPagination(data.pagination || { page, pages: 0, total: 0 })
      } catch (requestError) {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load products'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [q, category, sort, offers, maxPrice, page])

  const activeCategory = useMemo(
    () => categories.find((item) => item.slug === category),
    [categories, category],
  )

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    updateParam('q', term.trim())
  }

  const clearAll = () => setParams(new URLSearchParams())

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Shop"
        title={offers ? 'Special offers' : activeCategory ? activeCategory.name : 'All products'}
        description={
          offers
            ? 'Discounted favourites while stocks last. Prices are verified on the server at checkout.'
            : 'Fresh produce, groceries, household essentials and more — delivered or ready for collection.'
        }
        actions={
          <form onSubmit={submitSearch} className="flex w-full max-w-xs items-center gap-2 rounded-pill border border-black/10 bg-white p-1 pl-3">
            <Search className="h-4 w-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search products"
              className="h-8 w-full bg-transparent text-sm focus:outline-none"
              aria-label="Search products"
            />
            <button type="submit" className="btn-primary h-8 px-4 text-xs">
              Go
            </button>
          </form>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => updateParam('category', '')}
          className={`rounded-pill px-3.5 py-2 text-xs font-semibold transition ${
            !category ? 'bg-brand-600 text-white' : 'bg-white text-ink/70 hover:text-brand-700'
          }`}
        >
          All
        </button>
        {categories.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => updateParam('category', item.slug)}
            className={`rounded-pill px-3.5 py-2 text-xs font-semibold transition ${
              category === item.slug
                ? 'bg-brand-600 text-white'
                : 'bg-white text-ink/70 hover:text-brand-700'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
          Quick budget
        </span>
        {budgetOptions.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => updateParam('maxPrice', String(amount))}
            className={`rounded-pill border px-3 py-1.5 text-[11px] font-semibold transition ${
              maxPrice === String(amount)
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-black/10 bg-white text-ink/70 hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            Under {formatRwf(amount)}
          </button>
        ))}
        {maxPrice && (
          <button
            type="button"
            onClick={() => updateParam('maxPrice', '')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-brand-700"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Remove budget
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-black/5 bg-white px-4 py-3 shadow-soft">
        <div className="flex items-center gap-2 text-sm text-muted">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <span className="font-semibold text-ink">{pagination.total}</span> products
          {q && <span>for “{q}”</span>}
          {offers && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-accent-100 px-2 py-0.5 text-[11px] font-bold text-brand-900">
              <Tag className="h-3 w-3" aria-hidden="true" />
              On offer
            </span>
          )}
          {maxPrice && (
            <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
              Under {formatRwf(Number(maxPrice))}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(q || category || offers || maxPrice) && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-brand-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => updateParam('sort', event.target.value)}
            className="rounded-pill border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-brand-400 focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card h-72 animate-pulse bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6">
          <EmptyState
            title="Could not load products"
            description={error}
            action={
              <button type="button" onClick={() => setParams(new URLSearchParams(params))} className="btn-primary">
                Try again
              </button>
            }
          />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No products found"
            description="Try a different keyword, category or clear your filters."
            action={
              <button type="button" onClick={clearAll} className="btn-primary">
                Browse all products
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onChange={(nextPage) => updateParam('page', String(nextPage))}
          />
        </>
      )}
    </div>
  )
}
