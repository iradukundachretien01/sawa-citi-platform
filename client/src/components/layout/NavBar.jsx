import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, LayoutGrid, Phone } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { brand } from '../../utils/brand.config'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Get App', to: '/get-app' },
  { label: 'Special Offers', to: '/shop?offers=true' },
  { label: 'Weekly List', to: '/weekly-list' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { categories } = useCategories()

  return (
    <nav className="relative z-30 border-b border-black/5 bg-white">
      <div className="container-page flex h-12 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="category-menu"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-700 sm:text-[13px]"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            All Categories
            <ChevronDown
              className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm font-medium text-ink/80">
            {navLinks.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-pill px-3 py-2 transition hover:bg-brand-50 hover:text-brand-700 ${
                      isActive ? 'bg-brand-50 text-brand-700' : ''
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={`tel:${brand.phone.replace(/\s/g, '')}`}
          className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800 lg:flex"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {brand.phone}
        </a>
      </div>

      {open && (
        <div
          id="category-menu"
          className="absolute left-1/2 top-full w-[min(92vw,680px)] -translate-x-1/2 rounded-b-card border border-t-0 border-black/5 bg-white p-4 shadow-lift"
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              All products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-left text-sm text-ink/80 hover:bg-brand-50 hover:text-brand-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
