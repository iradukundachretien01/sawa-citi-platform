import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Search } from 'lucide-react'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/common/StatusBadge'
import { api, apiMessage } from '../../lib/api'
import {
  formatDate,
  orderStatusLabels,
  substitutionPreferenceLabels,
} from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

const statusOptions = Object.entries(orderStatusLabels)

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 })
  const [filters, setFilters] = useState({ status: '', q: '', page: 1 })
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/admin/orders', {
          params: {
            status: filters.status || undefined,
            q: filters.q || undefined,
            page: filters.page,
            limit: 20,
          },
        })
        if (cancelled) return
        setOrders(data.data || [])
        setPagination(data.pagination || { page: 1, pages: 0, total: 0 })
      } catch (requestError) {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load orders'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filters])

  const submitSearch = (event) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, q: term.trim(), page: 1 }))
  }

  const updateStatus = async (order, status) => {
    if (!status || status === order.orderStatus) return
    setUpdatingId(order._id)
    setError('')
    setNotice('')
    try {
      const { data } = await api.patch(`/admin/orders/${order._id}/status`, {
        status,
        note: `Updated by staff`,
      })
      setOrders((current) =>
        current.map((item) => (item._id === order._id ? { ...item, ...data.data } : item)),
      )
      setNotice(`${order.orderNumber} updated to ${orderStatusLabels[status] || status}.`)
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not update the order'))
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Orders
          </p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Order management</h2>
          <p className="mt-1 text-sm text-muted">
            Move orders through processing, ready, delivery and completion.
          </p>
        </div>
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
              aria-hidden="true"
            />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Order number"
              className="w-44 rounded-pill border border-black/10 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
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
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary h-9 px-4 text-xs">
            Search
          </button>
        </form>
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
          <Spinner label="Loading orders..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-brand-50/60 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Order</th>
                  <th className="px-4 py-2.5 font-bold">Customer</th>
                  <th className="px-4 py-2.5 font-bold">Branch</th>
                  <th className="px-4 py-2.5 font-bold">Payment</th>
                  <th className="px-4 py-2.5 font-bold">Total</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold">Update</th>
                  <th className="px-4 py-2.5 font-bold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-50/30">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-ink">{order.orderNumber}</p>
                      <p className="text-[11px] text-muted">{formatDate(order.createdAt, true)}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-ink">{order.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-muted">{order.user?.phone || order.user?.email}</p>
                      <p className="mt-1 max-w-48 text-[11px] text-brand-700">
                        {substitutionPreferenceLabels[order.substitutionPreference || 'ask_first']}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">{order.branch?.name || '—'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={order.paymentStatus} kind="payment" />
                      <p className="mt-1 text-[11px] capitalize text-muted">
                        {order.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-brand-700">
                      {formatRwf(order.total)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={order.orderStatus}
                        disabled={updatingId === order._id || order.orderStatus === 'cancelled'}
                        onChange={(event) => updateStatus(order, event.target.value)}
                        className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-semibold focus:border-brand-400 focus:outline-none disabled:opacity-50"
                        aria-label={`Update status for ${order.orderNumber}`}
                      >
                        {statusOptions.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/account/orders/${order._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                      No orders match these filters.
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
      <p className="text-[11px] text-muted">{pagination.total} order(s) total.</p>
    </div>
  )
}
