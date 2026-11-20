import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ReceiptText,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/common/StatusBadge'
import { api, apiMessage } from '../../lib/api'
import {
  formatDate,
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  substitutionPreferenceLabels,
} from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

export default function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const justPlaced = Boolean(location.state?.justPlaced)
  const paymentMessage = location.state?.paymentMessage || ''

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/orders/${id}`)
        setOrder(data.data)
      } catch (requestError) {
        setError(apiMessage(requestError, 'Could not load this order'))
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [id],
  )

  const checkPayment = useCallback(
    async ({ silent = false } = {}) => {
      const paymentId = order?.payment?._id
      if (!paymentId) return

      if (!silent) setCheckingPayment(true)
      try {
        await api.post(`/payments/${paymentId}/refresh`)
        await load({ silent })
      } catch (requestError) {
        if (!silent) setNotice(apiMessage(requestError, 'Could not refresh payment status'))
      } finally {
        if (!silent) setCheckingPayment(false)
      }
    },
    [load, order?.payment?._id],
  )

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (
      !order ||
      order.paymentMethod === 'cash_on_delivery' ||
      order.paymentStatus !== 'pending' ||
      !order.payment?._id
    ) {
      return undefined
    }

    const timer = setTimeout(() => {
      checkPayment({ silent: true })
    }, 5000)
    return () => clearTimeout(timer)
  }, [checkPayment, order])

  const cancel = async () => {
    if (!window.confirm('Cancel this order? Reserved stock will be returned to the branch.')) return
    setCancelling(true)
    setNotice('')
    try {
      await api.patch(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' })
      setNotice('Your order has been cancelled and stock restored.')
      await load()
    } catch (requestError) {
      setNotice(apiMessage(requestError, 'Could not cancel this order'))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <Spinner label="Loading order..." />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={ReceiptText}
          title="Order not found"
          description={error || 'This order may have been removed.'}
          action={
            <Link to="/account" className="btn-primary">
              Back to account
            </Link>
          }
        />
      </div>
    )
  }

  const canCancel = ['pending', 'processing'].includes(order.orderStatus)
  const events = order.statusHistory || []

  return (
    <div className="container-page py-8 sm:py-10">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to account
      </Link>

      {justPlaced && (
        <div className="mt-4 flex items-start gap-3 rounded-card border border-brand-200 bg-brand-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
          <div>
            <p className="font-display text-sm font-bold text-brand-800">
              Order placed successfully
            </p>
            <p className="text-xs text-brand-700">
              We reserved your items. Track progress below or from the tracking page.
            </p>
            {paymentMessage && (
              <p className="mt-2 text-xs font-semibold text-brand-800">{paymentMessage}</p>
            )}
          </div>
        </div>
      )}

      {order.paymentStatus === 'pending' && order.paymentMethod !== 'cash_on_delivery' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-accent-300 bg-accent-100 p-4">
          <div>
            <p className="font-display text-sm font-bold text-brand-900">
              Waiting for your MTN MoMo approval
            </p>
            <p className="mt-1 text-xs text-brand-800">
              Open the prompt on your phone and approve the payment. This page checks again every
              5 seconds.
            </p>
            {order.payment?.failureReason && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {order.payment.failureReason}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => checkPayment()}
            disabled={checkingPayment}
            className="btn-outline h-9 px-3 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${checkingPayment ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {checkingPayment ? 'Checking...' : 'Check now'}
          </button>
        </div>
      )}

      {order.paymentStatus === 'failed' && order.payment?.failureReason && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {order.payment.failureReason}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Order
          </p>
          <h1 className="font-display text-2xl font-extrabold text-ink">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-muted">
            Placed {formatDate(order.createdAt, true)} · {order.items?.length || 0} item(s)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} kind="payment" />
          {canCancel && (
            <button
              type="button"
              onClick={cancel}
              disabled={cancelling}
              className="btn-outline h-9 border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {cancelling ? 'Cancelling...' : 'Cancel order'}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
          {notice}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink">Items</h2>
            <ul className="mt-3 divide-y divide-black/5">
              {order.items.map((item, index) => (
                <li key={`${item.product}-${index}`} className="flex items-center gap-3 py-2.5">
                  <img
                    src={item.image || '/demo/hero.jpg'}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-[11px] text-muted">
                      {item.quantity} × {formatRwf(item.price)}
                      {item.unit ? ` · ${item.unit}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand-700">
                    {formatRwf(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink">Progress</h2>
            <ol className="mt-3 space-y-3">
              {events.map((event, index) => {
                const isLast = index === events.length - 1
                return (
                  <li key={`${event.status}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          isLast ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {event.status === 'cancelled' ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : isLast ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                      </span>
                      {index < events.length - 1 && <span className="mt-1 h-6 w-px bg-brand-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-ink">
                        {orderStatusLabels[event.status] || event.status}
                      </p>
                      {event.note && <p className="text-xs text-muted">{event.note}</p>}
                      <p className="text-[11px] text-muted/70">{formatDate(event.at, true)}</p>
                    </div>
                  </li>
                )
              })}
            </ol>

            {order.delivery?.trackingEvents?.length > 0 && (
              <div className="mt-4 rounded-xl bg-brand-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  Delivery updates
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-brand-800">
                  {order.delivery.trackingEvents.map((event, index) => (
                    <li key={`${event.status}-${index}`} className="flex items-center justify-between gap-2">
                      <span>{event.note || event.status}</span>
                      <span className="shrink-0 text-[11px] text-brand-700/70">
                        {formatDate(event.at, true)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold text-ink">{formatRwf(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold text-ink">
                  {order.deliveryFee > 0 ? formatRwf(order.deliveryFee) : 'Free'}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">
                    Discount{order.promotionCode ? ` (${order.promotionCode})` : ''}
                  </dt>
                  <dd className="font-semibold text-brand-700">−{formatRwf(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-black/5 pt-2">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-xl font-extrabold text-brand-700">
                  {formatRwf(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Fulfilment</h2>
            <div className="mt-3 space-y-2 text-sm text-muted">
              <p className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="capitalize">{order.deliveryType}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  {order.branch?.name}
                  {order.shippingAddress?.line1 ? ` · ${order.shippingAddress.line1}` : ''}
                  {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                </span>
              </p>
              {order.shippingAddress?.phone && (
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {order.shippingAddress.phone}
                </p>
              )}
            </div>
            <p className="mt-3 border-t border-black/5 pt-3 text-xs text-muted">
              Out-of-stock preference:{' '}
              <span className="font-semibold text-ink">
                {substitutionPreferenceLabels[order.substitutionPreference || 'ask_first']}
              </span>
            </p>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Payment</h2>
            <p className="mt-2 text-sm font-semibold text-ink">
              {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
            </p>
            <p className="text-xs text-muted">
              Status: {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
            </p>
            <p className="mt-2 rounded-lg bg-accent-100 px-3 py-2 text-[11px] font-semibold text-brand-900">
              TEST MODE — no real money was charged.
            </p>
            <Link to="/track" className="btn-outline mt-3 w-full text-xs">
              Track this order
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
