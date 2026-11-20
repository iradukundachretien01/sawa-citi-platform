import { useEffect, useState } from 'react'
import { Plus, Power, Trash2 } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'
import { api, apiMessage } from '../../lib/api'

export default function AdminCategoriesPage() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', description: '', image: '', sortOrder: 0 })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get('/categories')
      .then(({ data }) => {
        if (!cancelled) setCategories(data.data || [])
      })
      .catch((requestError) => {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load categories'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const create = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await api.post('/admin/categories', {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      })
      setNotice(`${form.name} created.`)
      setForm({ name: '', description: '', image: '', sortOrder: 0 })
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not create the category'))
    } finally {
      setSaving(false)
    }
  }

  const deactivate = async (category) => {
    if (!window.confirm(`Deactivate ${category.name}? Products keep their category link.`)) return
    setError('')
    setNotice('')
    try {
      await api.patch(`/admin/categories/${category._id}`, { isActive: false })
      setNotice(`${category.name} deactivated.`)
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not update the category'))
    }
  }

  const remove = async (category) => {
    if (!window.confirm(`Delete ${category.name}? Only empty categories can be deleted.`)) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/admin/categories/${category._id}`)
      setNotice(`${category.name} deleted.`)
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not delete the category'))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
          Catalogue
        </p>
        <h2 className="font-display text-2xl font-extrabold text-ink">Categories</h2>
        <p className="mt-1 text-sm text-muted">
          Group products into the categories shown on the storefront and mega menu.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}
      {notice && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
          {notice}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={create} className="card h-fit space-y-3 p-4">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <Plus className="h-4 w-4 text-brand-600" aria-hidden="true" />
            New category
          </h3>
          <label className="block text-xs font-semibold text-muted">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              required
            />
          </label>
          <label className="block text-xs font-semibold text-muted">
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-muted">
            Image URL
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              placeholder="/demo/cat-fruits.jpg"
            />
          </label>
          <label className="block text-xs font-semibold text-muted">
            Sort order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, sortOrder: event.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            />
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full text-xs">
            {saving ? 'Creating...' : 'Create category'}
          </button>
        </form>

        <div className="card overflow-hidden">
          {loading ? (
            <Spinner label="Loading categories..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-brand-50/60 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Category</th>
                    <th className="px-4 py-2.5 font-bold">Products</th>
                    <th className="px-4 py-2.5 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-brand-50/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={category.image || '/demo/hero.jpg'}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-ink">{category.name}</p>
                            <p className="text-[11px] text-muted">{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted">
                        {category.productCount ?? 0}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => deactivate(category)}
                            className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50"
                            aria-label={`Deactivate ${category.name}`}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => remove(category)}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                              aria-label={`Delete ${category.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                        No active categories.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
