import { Link, useLocation } from 'react-router-dom'
import { Phone, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import { brand } from '../../utils/brand.config'
import Logo from './Logo'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Product Gallery', to: '/gallery' },
  { label: 'Get the App', to: '/get-app' },
  { label: 'Special Offers', to: '/shop?offers=true' },
  { label: 'Weekly Shopping List', to: '/weekly-list' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
]

export default function MobileMenu({ open, onClose }) {
  const { categories } = useCategories()
  const { user } = useAuth()
  const location = useLocation()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative flex h-full w-[86%] max-w-sm animate-slide-in flex-col bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <Logo compact />
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Menu</p>
          <ul className="mt-2 space-y-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/track"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-brand-50 hover:text-brand-700"
              >
                Track Order
              </Link>
            </li>
          </ul>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-muted">
            Categories
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-1">
            <li>
              <Link
                to="/shop"
                onClick={onClose}
                className="block w-full rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                All products
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/shop?category=${category.slug}`}
                  onClick={onClose}
                  className="block w-full rounded-lg px-3 py-2 text-sm text-ink/75 hover:bg-brand-50 hover:text-brand-700"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl bg-brand-50 p-3">
            <Link
              to={user ? '/account' : '/login'}
              state={!user ? { from: `${location.pathname}${location.search}` } : undefined}
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              {user ? `My account (${user.name.split(' ')[0]})` : 'Sign in / Register'}
            </Link>
            {user?.role !== 'customer' && (
              <Link
                to="/admin"
                onClick={onClose}
                className="mt-2 block text-xs font-semibold text-muted hover:text-brand-700"
              >
                Open staff dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-black/5 px-5 py-4">
          <a
            href={`tel:${brand.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-sm font-semibold text-brand-700"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {brand.phone}
          </a>
          <p className="mt-1 text-xs text-muted">{brand.hours}</p>
        </div>
      </div>
    </div>
  )
}
