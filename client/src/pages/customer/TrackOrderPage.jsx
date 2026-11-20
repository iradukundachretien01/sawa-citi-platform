import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, MapPin, PackageSearch, Search, Truck } from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/common/StatusBadge'
import { api, apiMessage } from '../../lib/api'
import { formatDate, orderStatusLabels } from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

export default function TrackOrderPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('order') || ''
  const [orderNumber, setOrderNumber] = useState(initial)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = async (value) => {
    const number = value.trim()
    if (!number) {
      setError('Enter your order number to continue.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.get(`/orders/track/${encodeURIComponent(number)}`)
      setResult(data.data)
      setParams({ order: number }, { replace: true })
    } catch (requestError) {
      setError(apiMessage(requestError, 'We could not find an order with that number.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initial) lookup(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = (event) => {
    event.preventDefault()
    lookup(orderNumber)
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Order tracking"
        title="Track your order"
        description="Enter the order number from your confirmation (for example SC-XXXXXX) to see live status."
      />

      <form onSubmit={submit} className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
            aria-hidden="true"
          />
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
            placeholder="SC-XXXXXX"
            className="w-full rounded-pill border border-black/10 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-ink focus:border-brand-400 focus:outline-none"
            aria-label="Order number"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3">
          {loading ? 'Tracking...' : 'Track order'}
        </button>
      </form>

      <div className="mt-6 max-w-3xl">
        {loading ? (
          <Spinner label="Looking up your order..." />
        ) : error ? (
          <EmptyState
            icon={PackageSearch}
            title="Order not found"
            description={error}
            action={
              <button type="button" onClick={() => lookup(orderNumber)} className="btn-primary">
                Try again
              </button>
            }
          />
        ) : result ? (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                    Order
                  </p>
                  <h2 className="font-display text-xl font-extrabold text-ink">
                    {result.orderNumber}
                  </h2>
                  <p className="text-xs text-muted">Placed {formatDate(result.createdAt, true)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={result.orderStatus} />
                  <StatusBadge status={result.paymentStatus} kind="payment" />
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-3">
                <p className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
                  <Truck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  <span className="capitalize">{result.deliveryType}</span>
                </p>
                <p className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
                  <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {result.branch?.name || 'Sawa Citi'}
                </p>
                <p className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
                  <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {result.branch?.openingHours || 'Open daily'}
                </p>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-lg font-bold text-ink">Status timeline</h3>
              <ol className="mt-3 space-y-3">
                {result.statusHistory?.map((event, index) => (
                  <li key={`${event.status}-${index}`} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {orderStatusLabels[event.status] || event.status}
                      </p>
                      {event.note && <p className="text-xs text-muted">{event.note}</p>}
                      <p className="text-[11px] text-muted/70">{formatDate(event.at, true)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-lg font-bold text-ink">Items</h3>
              <ul className="mt-3 divide-y divide-black/5">
                {result.items?.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex items-center gap-3 py-2.5">
                    <img
                      src={item.image || '/demo/hero.jpg'}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                      <p className="text-[11px] text-muted">Quantity {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-brand-700">
                      {formatRwf(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="font-display text-lg font-extrabold text-brand-700">
                  {formatRwf(result.total)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-brand-200 bg-white p-6 text-sm text-muted">
            <p className="font-semibold text-ink">Where do I find my order number?</p>
            <p className="mt-1">
              It appears on your order confirmation page, in your account orders list, and in the
              notification email (demo only). Example format: <strong>SC-123456</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
