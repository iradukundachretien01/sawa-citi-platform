import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Percent,
  ReceiptText,
  Star,
  Store,
  Tags,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../layout/Logo'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'manager'], end: true },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: ReceiptText,
    roles: ['admin', 'manager', 'employee'],
  },
  { to: '/admin/products', label: 'Products', icon: Package, roles: ['admin', 'manager'] },
  { to: '/admin/categories', label: 'Categories', icon: Tags, roles: ['admin', 'manager'] },
  {
    to: '/admin/inventory',
    label: 'Inventory',
    icon: Boxes,
    roles: ['admin', 'manager', 'employee'],
  },
  { to: '/admin/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager'] },
  { to: '/admin/promotions', label: 'Promotions', icon: Percent, roles: ['admin', 'manager'] },
  { to: '/admin/branches', label: 'Branches', icon: Building2, roles: ['admin', 'manager'] },
  { to: '/admin/staff', label: 'Staff', icon: Users, roles: ['admin'] },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, roles: ['admin', 'manager'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const items = navItems.filter((item) => item.roles.includes(user?.role))

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[264px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-black/5 bg-white transition-transform duration-250 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3.5">
          <Logo compact />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="icon-btn lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-black/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
            Management
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">{user?.name}</p>
          <p className="truncate text-[11px] capitalize text-muted">{user?.role}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-soft'
                      : 'text-ink/70 hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-black/5 p-2.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/70 hover:bg-brand-50 hover:text-brand-700"
          >
            <Store className="h-4 w-4" aria-hidden="true" />
            View store
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="icon-btn lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
                Sawa Citi
              </p>
              <h1 className="font-display text-base font-extrabold text-ink">
                Operations console
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden text-xs font-semibold text-brand-700 hover:underline sm:block">
              Storefront
            </Link>
            <span className="hidden rounded-pill bg-brand-50 px-3 py-1.5 text-[11px] font-bold capitalize text-brand-700 sm:block">
              {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
