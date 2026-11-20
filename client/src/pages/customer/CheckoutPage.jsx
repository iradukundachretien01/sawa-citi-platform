import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Banknote,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useBranches } from '../../hooks/useBranches'
import { api, apiMessage } from '../../lib/api'
import { formatRwf } from '../../utils/formatRwf'

const paymentIcons = {
  mock: BadgeCheck,
  cash_on_delivery: Banknote,
  mtn_momo: Smartphone,
  airtel: Smartphone,
  card: CreditCard,
}

const fallbackPaymentConfig = {
  mode: 'test',
  methods: [
    {
      value: 'cash_on_delivery',
      label: 'Cash on delivery',
      hint: 'Pay when you receive or collect',
      available: true,
      test: false,
    },
    {
      value: 'mock',
      label: 'Test payment',
      hint: 'Development test payment; no real charge',
      available: import.meta.env.DEV,
      test: true,
    },
    {
      value: 'mtn_momo',
      label: 'MTN Mobile Money',
      hint: 'Requires merchant credentials',
      available: false,
      test: false,
    },
  ],
}

const newIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `sawa-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const { branches, loading: branchesLoading } = useBranches()

  const defaultAddress = useMemo(() => {
    if (!user?.addresses?.length) return null
    return user.addresses.find((address) => address.isDefault) || user.addresses[0]
  }, [user])

  const [branchId, setBranchId] = useState('')
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [substitutionPreference, setSubstitutionPreference] = useState('ask_first')
  const [address, setAddress] = useState({
    line1: defaultAddress?.line1 || '',
    city: defaultAddress?.city || 'Kigali',
    phone: defaultAddress?.phone || user?.phone || '',
    notes: '',
  })
  const [paymentConfig, setPaymentConfig] = useState(fallbackPaymentConfig)
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')
  const [promotionCode, setPromotionCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [placing, setPlacing] = useState(false)
  const idempotencyKey = useRef(newIdempotencyKey())

  useEffect(() => {
    let cancelled = false

    const loadConfig = async () => {
      try {
        const { data } = await api.get('/payments/config')
        if (!cancelled && data?.data) setPaymentConfig(data.data)
      } catch {
        if (!cancelled) setPaymentConfig(fallbackPaymentConfig)
      }
    }

    loadConfig()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0]._id)
    }
  }, [branches, branchId])

  const branch = branches.find((item) => item._id === branchId)
  const deliveryFee = deliveryType === 'delivery' ? branch?.deliveryFee || 0 : 0
  const total = subtotal + deliveryFee

  const paymentOptions = useMemo(
    () =>
      (paymentConfig.methods || [])
        .filter((method) => method.available)
        .map((method) => ({
          ...method,
          icon: paymentIcons[method.value] || CreditCard,
        })),
    [paymentConfig],
  )
  const usingLivePayment = paymentOptions.some(
    (method) => method.value === paymentMethod && !method.test,
  )

  useEffect(() => {
    if (!branch) return
    if (deliveryType === 'delivery' && !branch.supportsDelivery) setDeliveryType('collection')
    if (deliveryType === 'collection' && !branch.supportsCollection) setDeliveryType('delivery')
  }, [branch, deliveryType])

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <PageHeader eyebrow="Checkout" title="Checkout" />
        <div className="mt-6">
          <EmptyState
            title="Nothing to check out"
            description="Add products to your cart before placing an order."
            action={
              <Link to="/shop" className="btn-primary">
                Browse products
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  if (branchesLoading) {
    return (
      <div className="container-page py-10">
        <Spinner label="Loading branches..." />
      </div>
    )
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!branchId) {
      setError('Please choose a branch.')
      return
    }
    if (deliveryType === 'delivery' && !address.line1.trim()) {
      setError('Please enter the delivery address.')
      return
    }
    if (!address.phone.trim()) {
      setError('Please enter a contact phone number.')
      return
    }

    setPlacing(true)
    try {
      const { data } = await api.post('/orders', {
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        deliveryType,
        substitutionPreference,
        branchId,
        shippingAddress: {
          line1: address.line1.trim(),
          city: address.city.trim() || 'Kigali',
          phone: address.phone.trim(),
          notes: address.notes.trim(),
        },
        paymentMethod,
        promotionCode: promotionCode.trim(),
        idempotencyKey: idempotencyKey.current,
      })

      const order = data.data

      let paymentMessage = ''
      if (paymentMethod !== 'cash_on_delivery') {
        const paymentResponse = await api.post('/payments/initiate', {
          orderId: order._id,
          idempotencyKey: idempotencyKey.current,
        })
        paymentMessage = paymentResponse.data?.data?.message || 'Payment initiated.'
        setNotice(paymentMessage)
      } else {
        paymentMessage = 'Order placed. Pay in cash when you receive or collect it.'
        setNotice(paymentMessage)
      }

      clearCart()
      navigate(`/account/orders/${order._id}`, {
        state: { justPlaced: true, paymentMessage },
      })
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not place your order. Please try again.'))
      idempotencyKey.current = newIdempotencyKey()
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Checkout"
        title="Secure checkout"
        description="Review your order, choose delivery or collection, then confirm. Stock is reserved atomically on the server."
      />

      <form onSubmit={placeOrder} className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Fulfilment
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted">
                Branch
                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  required
                >
                  {branches.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="text-xs font-semibold text-muted">
                Method
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    disabled={branch && !branch.supportsDelivery}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      deliveryType === 'delivery'
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-black/10 bg-white text-ink/70'
                    }`}
                  >
                    <Truck className="h-4 w-4" aria-hidden="true" />
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('collection')}
                    disabled={branch && !branch.supportsCollection}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      deliveryType === 'collection'
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-black/10 bg-white text-ink/70'
                    }`}
                  >
                    <Store className="h-4 w-4" aria-hidden="true" />
                    Collection
                  </button>
                </div>
              </div>
            </div>

            {branch && (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
                {branch.name} · {branch.address} · {branch.openingHours}
                {deliveryType === 'delivery' && branch.deliveryFee > 0
                  ? ` · Delivery ${formatRwf(branch.deliveryFee)}`
                  : ' · Free collection'}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted sm:col-span-2">
                {deliveryType === 'delivery' ? 'Delivery address' : 'Contact / notes'}
                <input
                  value={address.line1}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, line1: event.target.value }))
                  }
                  placeholder="Street, sector, house number"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  required={deliveryType === 'delivery'}
                />
              </label>
              <label className="text-xs font-semibold text-muted">
                City / district
                <input
                  value={address.city}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, city: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                />
              </label>
              <label className="text-xs font-semibold text-muted">
                Phone
                <input
                  value={address.phone}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="+250 7xx xxx xxx"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-muted sm:col-span-2">
                Delivery notes (optional)
                <textarea
                  value={address.notes}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="Landmark, gate colour, preferred time..."
                />
              </label>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink">
              If an item is unavailable
            </h2>
            <p className="mt-1 text-xs text-muted">
              Choose how the store should handle unavailable items. Your choice will be included
              with the order for staff to review.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                {
                  value: 'ask_first',
                  label: 'Ask me first',
                  hint: 'Request contact before replacing any item',
                },
                {
                  value: 'allow_similar',
                  label: 'Allow similar items',
                  hint: 'A similar item may be selected',
                },
                {
                  value: 'skip_unavailable',
                  label: 'Skip unavailable',
                  hint: 'Do not replace unavailable items',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition ${
                    substitutionPreference === option.value
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-black/10 bg-white hover:border-brand-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="substitutionPreference"
                    value={option.value}
                    checked={substitutionPreference === option.value}
                    onChange={() => setSubstitutionPreference(option.value)}
                    className="mt-0.5 accent-brand-600"
                  />
                  <span>
                    <span className="block text-sm font-bold text-ink">{option.label}</span>
                    <span className="block text-[11px] text-muted">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <CreditCard className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Payment
            </h2>
            <p
              className={`mt-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                usingLivePayment
                  ? 'bg-brand-50 text-brand-800'
                  : 'bg-accent-100 text-brand-900'
              }`}
            >
              {usingLivePayment
                ? 'LIVE PAYMENT: you will approve this payment in your MTN MoMo wallet.'
                : paymentConfig.mode === 'live'
                  ? 'Cash on delivery is selected. Choose MTN Mobile Money to pay live.'
                  : 'TEST MODE: test payments and cash on delivery do not move real money.'}
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon
                const selected = paymentMethod === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!option.available}
                    onClick={() => setPaymentMethod(option.value)}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      selected
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-black/10 bg-white hover:border-brand-200'
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 ${selected ? 'text-brand-700' : 'text-muted'}`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-bold text-ink">{option.label}</span>
                      <span className="block text-[11px] text-muted">{option.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {paymentMethod === 'mtn_momo' && (
              <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
                Use the phone number above as your MTN MoMo number. After placing the order, approve
                the payment prompt on that phone. We will update the order automatically.
              </p>
            )}

            <label className="mt-4 block text-xs font-semibold text-muted">
              Promotion code (optional)
              <div className="mt-1 flex gap-2">
                <input
                  value={promotionCode}
                  onChange={(event) => setPromotionCode(event.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium uppercase text-ink focus:border-brand-400 focus:outline-none"
                  maxLength={40}
                />
                {['WELCOME10', 'FRESH500'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPromotionCode(code)}
                    className="shrink-0 rounded-xl border border-brand-200 bg-brand-50 px-2.5 text-[11px] font-bold text-brand-700"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </label>
            <p className="mt-2 text-[11px] text-muted">
              Discounts are validated and applied by the server when the order is placed.
            </p>
          </section>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="font-display text-lg font-bold text-ink">Your order</h2>
          <ul className="mt-3 max-h-64 space-y-2.5 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-11 w-11 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                  <p className="text-[11px] text-muted">
                    {item.quantity} × {formatRwf(item.price)}
                  </p>
                </div>
                <span className="text-xs font-bold text-brand-700">
                  {formatRwf(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-black/5 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatRwf(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="font-semibold text-ink">
                {deliveryFee > 0 ? formatRwf(deliveryFee) : 'Free'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Discount</dt>
              <dd className="text-xs text-muted">Applied on confirmation</dd>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-display text-xl font-extrabold text-brand-700">
                {formatRwf(total)}
              </dd>
            </div>
          </dl>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              {notice}
            </p>
          )}

          <button type="submit" disabled={placing} className="btn-primary mt-4 w-full py-3">
            {placing ? 'Placing order...' : `Place order · ${formatRwf(total)}`}
          </button>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            By placing this order you agree to our{' '}
            <Link to="/terms" className="font-semibold text-brand-700 hover:underline">
              Terms of Use
            </Link>
            . Stock is reserved immediately.
          </p>
        </aside>
      </form>
    </div>
  )
}
