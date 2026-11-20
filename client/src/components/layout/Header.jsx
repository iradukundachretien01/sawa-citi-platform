import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useStore } from '../../context/StoreContext'
import Logo from './Logo'

export default function Header({ onMenuOpen }) {
  const { wishlist } = useStore()
  const { count, openCart } = useCart()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    const query = term.trim()
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-3 py-3.5 sm:gap-5 lg:flex-nowrap">
        <div className="flex flex-1 items-center justify-between gap-3 lg:flex-none">
          <Logo />
          <button
            type="button"
            className="icon-btn lg:hidden"
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          role="search"
          className="order-last flex w-full items-center gap-2 rounded-pill border border-black/10 bg-brand-50/70 p-1 pl-4 transition focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-soft sm:order-none sm:w-auto sm:flex-1 lg:max-w-2xl"
        >
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <label htmlFor="site-search" className="sr-only">
            Search for products
          </label>
          <input
            id="site-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search for products..."
            className="h-9 w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
          />
          <button type="submit" className="btn-primary h-9 shrink-0 px-5">
            Search
          </button>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to={user ? '/account' : '/login'}
            state={!user ? { from: `${location.pathname}${location.search}` } : undefined}
            className="hidden items-center gap-2 rounded-pill border border-black/10 px-3 py-2 text-xs font-semibold text-ink/80 transition hover:border-brand-300 hover:text-brand-700 md:flex"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            {user ? user.name.split(' ')[0] : 'Sign in'}
          </Link>

          <Link to="/wishlist" className="icon-btn relative" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-brand-900">
                {wishlist.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-pill bg-brand-600 px-3 text-white shadow-soft transition hover:bg-brand-700 sm:px-4"
            aria-label={`Open cart with ${count} items`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span className="hidden text-sm font-semibold sm:inline">Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-[11px] font-bold text-brand-900">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
