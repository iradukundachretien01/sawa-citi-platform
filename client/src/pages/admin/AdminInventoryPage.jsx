import { Fragment, useEffect, useState } from 'react'
import { AlertTriangle, Boxes, Check, History, Minus, Plus } from 'lucide-react'
import Spinner from '../../components/common/Spinner'
import { useBranches } from '../../hooks/useBranches'
import { api, apiMessage } from '../../lib/api'

const statusStyles = {
  in_stock: 'bg-brand-50 text-brand-700',
  low_stock: 'bg-accent-100 text-brand-900',
  out_of_stock: 'bg-red-50 text-red-600',
}

const statusLabels = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
}

export default function AdminInventoryPage() {
  const { branches } = useBranches()
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ branch: '', lowStock: false })
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState('')
  const [historyId, setHistoryId] = useState('')
  const [movementRows, setMovementRows] = useState([])
  const [movementError, setMovementError] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .get('/admin/inventory', {
        params: {
          branch: filters.branch || undefined,
          lowStock: filters.lowStock ? 'true' : undefined,
        },
      })
      .then(({ data }) => {
        if (!cancelled) {
          setRows(data.data || [])
          setDrafts({})
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load inventory'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters])

  const applyRow = (updated) => {
    setRows((current) =>
      current.map((row) => (row._id === updated._id ? { ...row, ...updated } : row)),
    )
  }

  const saveQuantity = async (row) => {
    const raw = drafts[row._id] ?? row.quantity
    const quantity = Number(raw)
    if (!Number.isFinite(quantity) || quantity < 0) {
      setError('Quantity must be zero or more.')
      return
    }
    setBusyId(row._id)
    setError('')
    setNotice('')
    try {
      const { data } = await api.patch(`/admin/inventory/${row._id}`, {
        quantity,
        reason: 'Manual stock count correction',
      })
      applyRow(data.data)
      setNotice(`Stock updated for ${row.product?.name}.`)
      setDrafts((current) => {
        const next = { ...current }
        delete next[row._id]
        return next
      })
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not update stock'))
    } finally {
      setBusyId('')
    }
  }

  const adjust = async (row, delta) => {
    setBusyId(row._id)
    setError('')
    setNotice('')
    try {
      const { data } = await api.patch(`/admin/inventory/${row._id}/adjust`, {
        delta,
        reason: `Manual inventory adjustment (${delta > 0 ? '+' : ''}${delta})`,
      })
      applyRow(data.data)
      setNotice(`${row.product?.name} adjusted by ${delta > 0 ? '+' : ''}${delta}.`)
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not adjust stock'))
    } finally {
      setBusyId('')
    }
  }

  const toggleHistory = async (row) => {
    if (historyId === row._id) {
      setHistoryId('')
      setMovementRows([])
      return
    }

    setHistoryId(row._id)
    setMovementRows([])
    setMovementError('')
    setLoadingHistory(true)
    try {
      const { data } = await api.get(`/admin/inventory/${row._id}/movements`)
      setMovementRows(data.data || [])
    } catch (requestError) {
      setMovementError(apiMessage(requestError, 'Could not load stock movement history'))
    } finally {
      setLoadingHistory(false)
    }
  }

  const lowCount = rows.filter((row) => (row.available ?? row.quantity - row.reserved) <= row.lowStockThreshold).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Stock
          </p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Inventory</h2>
          <p className="mt-1 text-sm text-muted">
            Quantities are per branch. Available stock excludes items reserved by open orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.branch}
            onChange={(event) =>
              setFilters((current) => ({ ...current, branch: event.target.value }))
            }
            className="rounded-pill border border-black/10 bg-white px-3 py-2 text-xs font-semibold focus:border-brand-400 focus:outline-none"
          >
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 rounded-pill border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink/70">
            <input
              type="checkbox"
              checked={filters.lowStock}
              onChange={(event) =>
                setFilters((current) => ({ ...current, lowStock: event.target.checked }))
              }
              className="h-3.5 w-3.5 rounded border-black/20 text-brand-600"
            />
            Low stock only
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Boxes className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Records</p>
            <p className="font-display text-lg font-extrabold text-ink">{rows.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-brand-900">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Low stock</p>
            <p className="font-display text-lg font-extrabold text-ink">{lowCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Branches</p>
            <p className="font-display text-lg font-extrabold text-ink">{branches.length}</p>
          </div>
        </div>
      </div>

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
          <Spinner label="Loading inventory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-brand-50/60 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Product</th>
                  <th className="px-4 py-2.5 font-bold">Branch</th>
                  <th className="px-4 py-2.5 font-bold">Reserved</th>
                  <th className="px-4 py-2.5 font-bold">Available</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold">Quantity</th>
                  <th className="px-4 py-2.5 font-bold">Adjust</th>
                  <th className="px-4 py-2.5 font-bold">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rows.map((row) => {
                  const available = row.available ?? row.quantity - row.reserved
                  const status = row.stockStatus || (available <= 0 ? 'out_of_stock' : available <= row.lowStockThreshold ? 'low_stock' : 'in_stock')
                  const draft = drafts[row._id] ?? row.quantity
                  return (
                    <Fragment key={row._id}>
                    <tr className="hover:bg-brand-50/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.product?.images?.[0] || '/demo/hero.jpg'}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-ink">{row.product?.name}</p>
                            <p className="text-[11px] text-muted">
                              SKU {row.product?.sku}
                              {row.product?.barcode ? ` · Barcode ${row.product.barcode}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted">{row.branch?.name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{row.reserved}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-ink">{available}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                            statusStyles[status] || 'bg-black/5 text-muted'
                          }`}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={draft}
                            onChange={(event) =>
                              setDrafts((current) => ({ ...current, [row._id]: event.target.value }))
                            }
                            className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs focus:border-brand-400 focus:outline-none"
                            aria-label={`Quantity for ${row.product?.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => saveQuantity(row)}
                            disabled={busyId === row._id}
                            className="rounded-lg bg-brand-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => adjust(row, -1)}
                            disabled={busyId === row._id || row.quantity <= 0}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-ink/70 hover:bg-brand-50 disabled:opacity-40"
                            aria-label="Decrease stock"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjust(row, 1)}
                            disabled={busyId === row._id}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-ink/70 hover:bg-brand-50 disabled:opacity-40"
                            aria-label="Increase stock"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjust(row, 10)}
                            disabled={busyId === row._id}
                            className="rounded-lg border border-black/10 px-2 py-1 text-[11px] font-bold text-ink/70 hover:bg-brand-50 disabled:opacity-40"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleHistory(row)}
                          aria-expanded={historyId === row._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-[11px] font-semibold text-ink/70 hover:bg-brand-50"
                        >
                          <History className="h-3.5 w-3.5" aria-hidden="true" />
                          History
                        </button>
                      </td>
                    </tr>
                    {historyId === row._id && (
                      <tr>
                        <td colSpan={8} className="bg-brand-50/40 px-4 py-3">
                          <h3 className="text-xs font-bold text-ink">
                            Recent stock movements · {row.product?.name}
                          </h3>
                          {movementError && (
                            <p className="mt-2 text-xs font-medium text-red-600">{movementError}</p>
                          )}
                          {loadingHistory ? (
                            <p className="mt-2 text-xs text-muted">Loading movement history...</p>
                          ) : movementRows.length ? (
                            <ul className="mt-2 divide-y divide-black/5">
                              {movementRows.map((movement) => (
                                <li
                                  key={movement._id}
                                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"
                                >
                                  <span className="font-semibold text-ink">
                                    {movement.type.replace(/_/g, ' ')}
                                    {movement.quantityDelta !== 0 &&
                                      ` · ${movement.quantityDelta > 0 ? '+' : ''}${movement.quantityDelta} units`}
                                  </span>
                                  <span className="text-muted">
                                    {movement.reason || 'No reason provided'}
                                    {movement.performedBy?.name
                                      ? ` · ${movement.performedBy.name}`
                                      : ''}
                                  </span>
                                  <time className="text-muted">
                                    {new Intl.DateTimeFormat('en-RW', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    }).format(new Date(movement.createdAt))}
                                  </time>
                                  {movement.status !== 'completed' && (
                                    <span className="font-bold text-accent-700">
                                      {movement.status}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            !movementError && (
                              <p className="mt-2 text-xs text-muted">No stock movements recorded yet.</p>
                            )
                          )}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  )
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                      No inventory records match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
