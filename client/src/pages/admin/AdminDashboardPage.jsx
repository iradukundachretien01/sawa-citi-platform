import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  ReceiptText,
  TrendingUp,
  Users,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/common/StatusBadge'
import { api, apiMessage } from '../../lib/api'
import { formatDate } from '../../lib/normalize'
import { formatRwf } from '../../utils/formatRwf'

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get('/admin/dashboard')
      .then(({ data: response }) => {
        if (!cancelled) setData(response.data)
      })
      .catch((requestError) => {
        if (!cancelled) setError(apiMessage(requestError, 'Could not load the dashboard'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <Spinner label="Loading dashboard..." />
  if (error) {
    return (
      <div className="rounded-card bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>
    )
  }

  const totals = data?.totals || {}
  const recentOrders = data?.recentOrders || []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Overview
          </p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Store performance</h2>
          <p className="mt-1 text-sm text-muted">
            Live totals from demo data. Revenue counts paid, non-cancelled orders.
          </p>
        </div>
        <Link to="/admin/analytics" className="btn-primary h-9 px-4 text-xs">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          Analytics
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatRwf(totals.revenue || 0)}
          hint={`${totals.paidOrders || 0} paid orders`}
          icon={TrendingUp}
        />
        <StatCard
          label="Orders"
          value={totals.totalOrders || 0}
          hint={`${totals.pendingOrders || 0} open`}
          icon={ReceiptText}
          tone="sky"
        />
        <StatCard
          label="Customers"
          value={totals.totalCustomers || 0}
          hint={`Avg order ${formatRwf(totals.avgOrderValue || 0)}`}
          icon={Users}
          tone="accent"
        />
        <StatCard
          label="Low stock"
          value={totals.lowStockCount || 0}
          hint={`${totals.totalProducts || 0} active products`}
          icon={AlertTriangle}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-3">
            <h3 className="font-display text-base font-bold text-ink">Recent orders</h3>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-brand-50/60 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Order</th>
                  <th className="px-4 py-2.5 font-bold">Customer</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold">Total</th>
                  <th className="px-4 py-2.5 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-50/30">
                    <td className="px-4 py-2.5 font-semibold text-ink">{order.orderNumber}</td>
                    <td className="px-4 py-2.5 text-muted">{order.user?.name || 'Customer'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-brand-700">
                      {formatRwf(order.total)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <Link to="/admin/orders" className="card flex items-center justify-between p-4 hover:border-brand-200">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
              </span>
              Process orders
            </span>
            <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
          </Link>
          <Link to="/admin/inventory" className="card flex items-center justify-between p-4 hover:border-brand-200">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Boxes className="h-4 w-4" aria-hidden="true" />
              </span>
              Fix low stock
            </span>
            <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
          </Link>
          <Link to="/admin/analytics" className="card flex items-center justify-between p-4 hover:border-brand-200">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
              </span>
              Sales analytics
            </span>
            <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
          </Link>
          <div className="rounded-card bg-accent-100 p-4 text-xs leading-relaxed text-brand-900">
            <p className="font-bold">Demo data notice</p>
            <p className="mt-1">
              All figures come from seeded sample orders. Test payments are simulated and no real
              money moves.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
