import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api, apiErrors, apiMessage } from '../../lib/api'

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  price: '',
  discountPrice: '',
  size: '',
  image: '',
  description: '',
  status: 'active',
  isFeatured: false,
}

export default function ProductFormModal({ open, product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setFieldErrors([])
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category: product.category?._id || product.category || '',
        price: String(product.price ?? ''),
        discountPrice: String(product.discountPrice ?? ''),
        size: product.size || product.weight || '',
        image: product.images?.[0] || '',
        description: product.description || '',
        status: product.status || 'active',
        isFeatured: Boolean(product.isFeatured),
      })
    } else {
      setForm({ ...emptyForm, category: categories[0]?._id || '' })
    }
  }, [open, product, categories])

  if (!open) return null

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors([])
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        barcode: form.barcode.trim(),
        category: form.category,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        size: form.size.trim(),
        description: form.description.trim(),
        images: form.image.trim() ? [form.image.trim()] : [],
        status: form.status,
        isFeatured: form.isFeatured,
      }
      if (product?._id) {
        await api.patch(`/admin/products/${product._id}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }
      onSaved()
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not save the product'))
      setFieldErrors(apiErrors(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-card bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5">
          <h2 className="font-display text-lg font-bold text-ink">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="max-h-[75vh] space-y-3 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-muted">
              Product name
              <input
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              SKU
              <input
                value={form.sku}
                onChange={(event) => update('sku', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm uppercase focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              Category
              <select
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted">
              Barcode
              <input
                value={form.barcode}
                onChange={(event) => update('barcode', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                maxLength={60}
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              Unit / size
              <input
                value={form.size}
                onChange={(event) => update('size', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="e.g. 1 kg, 500 ml"
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              Price (RWF)
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => update('price', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              Discount price (RWF)
              <input
                type="number"
                min="0"
                value={form.discountPrice}
                onChange={(event) => update('discountPrice', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="0 = no discount"
              />
            </label>
            <label className="text-xs font-semibold text-muted sm:col-span-2">
              Image URL
              <input
                value={form.image}
                onChange={(event) => update('image', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="/demo/p-apples.jpg or https://..."
              />
            </label>
            <label className="text-xs font-semibold text-muted sm:col-span-2">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              Status
              <select
                value={form.status}
                onChange={(event) => update('status', event.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => update('isFeatured', event.target.checked)}
                className="h-4 w-4 rounded border-black/20 text-brand-600 focus:ring-brand-400"
              />
              Featured on homepage
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
          {fieldErrors.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {fieldErrors.map((item) => (
                <li key={`${item.path}-${item.message}`}>• {item.message}</li>
              ))}
            </ul>
          )}

          <div className="flex justify-end gap-2 border-t border-black/5 pt-3">
            <button type="button" onClick={onClose} className="btn-outline text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : product ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
