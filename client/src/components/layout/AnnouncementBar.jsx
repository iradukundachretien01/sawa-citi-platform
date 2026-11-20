import { Link } from 'react-router-dom'
import { Headphones, MapPin } from 'lucide-react'
import { brand } from '../../utils/brand.config'

export default function AnnouncementBar() {
  return (
    <div className="bg-brand-800 text-white">
      <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] font-medium sm:text-xs">
        <p className="flex items-center gap-2">
          <span className="truncate">{brand.tagline}</span>
        </p>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link className="hidden items-center gap-1.5 hover:text-accent-200 sm:flex" to="/track">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Track Order
          </Link>
          <span className="hidden text-white/30 sm:inline">|</span>
          <Link className="hidden items-center gap-1.5 hover:text-accent-200 md:flex" to="/faq">
            <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
            Help
          </Link>
          <span className="hidden text-white/30 md:inline">|</span>
          <Link className="hover:text-accent-200" to="/contact">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
