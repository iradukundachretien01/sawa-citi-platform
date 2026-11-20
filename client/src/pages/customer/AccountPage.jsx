import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import { api, apiMessage } from '../../lib/api'
import { formatDate } from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

export default function AccountPage() {
  const { user, logout, refreshMe } = useAuth()
  const { wishlist } = useStore()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordNotice, setPasswordNotice] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get('/orders/mine')
      .then(({ data }) => {
        if (!cancelled) setOrders(data.data || [])
      })
      .catch((error) => {
        if (!cancelled) setOrdersError(apiMessage(error, 'Could not load your orders'))
      })
      .finally(() => {
        if (!cancelled) setLoadingOrders(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    refreshMe().catch(() => {})
  }, [refreshMe])

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordNotice('')

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      await api.patch('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordNotice('Password updated. Other sessions have been signed out.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(apiMessage(error, 'Could not update your password'))
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user) return null

  const initials = user.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="My account"
        title={`Hello, ${user.name?.split(' ')[0] || 'there'}`}
        description="Manage your details, review orders and keep your account secure."
        actions={
          <button type="button" onClick={signOut} className="btn-outline h-9 px-3 text-xs">
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-bold text-white">
                {initials || 'SC'}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-ink">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <User className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <dt className="sr-only">Role</dt>
                <dd className="capitalize">{user.role}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Phone className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <dt className="sr-only">Phone</dt>
                <dd>{user.phone || 'No phone saved'}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <dt className="sr-only">Status</dt>
                <dd className="capitalize">{user.status || 'active'}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Saved addresses</h2>
            {user.addresses?.length ? (
              <ul className="mt-3 space-y-2">
                {user.addresses.map((address) => (
                  <li key={address._id || address.line1} className="rounded-xl bg-brand-50 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-semibold text-brand-800">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {address.label || 'Address'}
                      {address.isDefault && (
                        <span className="rounded-pill bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {address.line1}, {address.city}
                      {address.phone ? ` · ${address.phone}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No saved addresses yet. You can enter one at checkout.
              </p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Quick links</h2>
            <div className="mt-3 grid gap-2">
              <Link to="/wishlist" className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100">
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Wishlist
                </span>
                <span className="rounded-pill bg-white px-2 py-0.5 text-xs">{wishlist.length}</span>
              </Link>
              <Link to="/track" className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  Track an order
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/shop" className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" aria-hidden="true" />
                  Continue shopping
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-ink">Your orders</h2>
              <span className="text-xs font-semibold text-muted">{orders.length} order(s)</span>
            </div>

            {loadingOrders ? (
              <Spinner label="Loading orders..." className="py-8" />
            ) : ordersError ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {ordersError}
              </p>
            ) : orders.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={Package}
                  title="No orders yet"
                  description="Your orders will appear here after checkout."
                  action={
                    <Link to="/shop" className="btn-primary">
                      Start shopping
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {orders.map((order) => (
                  <li key={order._id}>
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">{order.orderNumber}</p>
                        <p className="text-[11px] text-muted">
                          {formatDate(order.createdAt, true)} · {order.items?.length || 0} item(s)
                          {order.branch?.name ? ` · ${order.branch.name}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.orderStatus} />
                        <span className="font-display text-sm font-extrabold text-brand-700">
                          {formatRwf(order.total)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink">Security</h2>
            <p className="mt-1 text-xs text-muted">
              Changing your password signs out other devices for safety.
            </p>
            <form onSubmit={changePassword} className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold text-muted">
                Current password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  autoComplete="current-password"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-muted">
                New password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label className="text-xs font-semibold text-muted">
                Confirm new password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  autoComplete="new-password"
                  required
                />
              </label>
              <div className="sm:col-span-3">
                {passwordError && (
                  <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {passwordError}
                  </p>
                )}
                {passwordNotice && (
                  <p className="mb-2 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                    {passwordNotice}
                  </p>
                )}
                <button type="submit" disabled={savingPassword} className="btn-primary">
                  {savingPassword ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
