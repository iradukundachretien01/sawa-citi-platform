import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Download, FileUp, Pencil, Plus, Search } from 'lucide-react'
import ProductFormModal from '../../components/admin/ProductFormModal'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useBranches } from '../../hooks/useBranches'
import { api, apiMessage } from '../../lib/api'
import { formatRwf } from '../../utils/formatRwf'

export default function AdminProductsPage() {
  const { isAdmin } = useAuth()
  const { branches } = useBranches()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 })
  const [filters, setFilters] = useState({ q: '', status: '', page: 1 })
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [importFile, setImportFile] = useState(null)
  const [importBranch, setImportBranch] = useState('')
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const defaultImportBranch = importBranch || branches[0]?._id || ''

  useEffect(() => {
    let cancelled = false
    api
      .get('/categories')
      .then(({ data }) => {
        if (!cancelled) setCategories(data.data || [])
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/admin/products', {
          params: {
            q: filters.q || undefined,
            status: filters.status || undefined,
            page: filters.page,
            limit: 20,
          },
        })
        if (cancelled) return
        setProducts(data.data || [])
        setPagination(data.pagination || { page: 1, pages: 0, total: 0 })
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
  }, [filters, refreshKey])

  const refresh = () => {
    setModalOpen(false)
    setEditing(null)
    setRefreshKey((key) => key + 1)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, q: term.trim(), page: 1 }))
  }

  const archive = async (product) => {
    if (!window.confirm(`Archive ${product.name}? It will be hidden from the storefront.`)) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/admin/products/${product._id}`)
      setNotice(`${product.name} archived.`)
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not archive the product'))
    }
  }

  const importCatalog = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!importFile || !defaultImportBranch) {
      setError('Choose an import file and a default branch.')
      return
    }

    setImporting(true)
    setError('')
    setNotice('')
    try {
      const payload = new FormData()
      payload.append('file', importFile)
      payload.append('branchId', defaultImportBranch)
      const { data } = await api.post('/admin/products/import', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setNotice(
        `Catalog import complete: ${data.data.imported} new product(s), ${data.data.updated} updated, ${data.data.stockRows} branch stock row(s).`,
      )
      setImportFile(null)
      form.reset()
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      const rowErrors = requestError?.response?.data?.errors
      const details = Array.isArray(rowErrors)
        ? ` ${rowErrors.slice(0, 3).map((item) => `Row ${item.row || item.field}: ${item.message}`).join(' ')}`
        : ''
      setError(`${apiMessage(requestError, 'Could not import catalog')}${details}`)
    } finally {
      setImporting(false)
    }
  }

  const exportCatalog = async () => {
    setExporting(true)
    setError('')
    setNotice('')
    try {
      const { data } = await api.get('/admin/products/export', { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'sawa-citi-catalog.csv'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Catalog CSV exported.')
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not export catalog'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Catalogue
          </p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Products</h2>
          <p className="mt-1 text-sm text-muted">
            Create, edit and archive products. New products start with zero stock in every branch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCatalog}
            disabled={exporting}
            className="btn-outline h-9 px-3 text-xs"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="btn-primary h-9 px-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add product
          </button>
        </div>
      </div>

      <form onSubmit={importCatalog} className="card grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="text-xs font-semibold text-muted">
          Import products (.csv or .xlsx, up to 5 MB)
          <input
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => setImportFile(event.target.files?.[0] || null)}
            className="mt-1 block w-full text-xs text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-700"
          />
        </label>
        <label className="text-xs font-semibold text-muted">
          Default branch (unless branch code is in the file)
          <select
            value={defaultImportBranch}
            onChange={(event) => setImportBranch(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            required
          >
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={importing} className="btn-outline h-9 px-4 text-xs">
          <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
          {importing ? 'Importing...' : 'Import catalog'}
        </button>
        <p className="text-[11px] text-muted sm:col-span-3">
          Required columns: SKU, Barcode, Product Name, Category, Price RWF, Stock Quantity.
          Optional columns: Branch Code and Image URL. Categories and branch codes must already exist.
          Imports update the independent Sawa Citi catalog; no public-site or Isokko synchronization
          is enabled.
        </p>
      </form>

      <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
            aria-hidden="true"
          />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search name or SKU"
            className="w-52 rounded-pill border border-black/10 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))
          }
          className="rounded-pill border border-black/10 bg-white px-3 py-2 text-xs font-semibold focus:border-brand-400 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="btn-outline h-9 px-4 text-xs">
          Search
        </button>
        <span className="ml-auto text-xs text-muted">{pagination.total} product(s)</span>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}
      {notice && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
          {notice}
        </p>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading products..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-brand-50/60 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Product</th>
                  <th className="px-4 py-2.5 font-bold">Category</th>
                  <th className="px-4 py-2.5 font-bold">Price</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold">Featured</th>
                  <th className="px-4 py-2.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-brand-50/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.images?.[0] || '/demo/hero.jpg'}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/product/${product.slug}`}
                            className="block max-w-[220px] truncate font-semibold text-ink hover:text-brand-700"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[11px] text-muted">
                            SKU {product.sku}
                            {product.barcode ? ` · Barcode ${product.barcode}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-brand-700">{formatRwf(product.price)}</p>
                      {product.discountPrice > 0 && (
                        <p className="text-[11px] text-muted line-through">
                          {formatRwf(product.discountPrice)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                          product.status === 'active'
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-black/5 text-muted'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">
                      {product.isFeatured ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(product)
                            setModalOpen(true)
                          }}
                          className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => archive(product)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                            aria-label={`Archive ${product.name}`}
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                      No products match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        onChange={(page) => setFilters((current) => ({ ...current, page }))}
      />

      <ProductFormModal
        open={modalOpen}
        product={editing}
        categories={categories}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSaved={refresh}
      />
    </div>
  )
}
