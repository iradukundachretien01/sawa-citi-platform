import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import AnnouncementBar from './AnnouncementBar'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import MobileMenu from './MobileMenu'
import NavBar from './NavBar'

export default function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { notice } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <NavBar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-pill bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lift animate-fade-up"
        >
          <CheckCircle2 className="h-4 w-4 text-accent-400" aria-hidden="true" />
          {notice}
        </div>
      )}
    </div>
  )
}
