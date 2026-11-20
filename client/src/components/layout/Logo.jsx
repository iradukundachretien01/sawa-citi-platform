import { Link } from 'react-router-dom'
import { brand } from '../../utils/brand.config'

export default function Logo({ compact = false, light = false }) {
  return (
    <Link
      to="/"
      className={`group flex items-center ${light ? 'rounded-xl bg-white px-2.5 py-1.5 shadow-soft' : ''}`}
      aria-label={`${brand.name} home`}
    >
      <img
        src="/logo.png"
        alt="Sawa Citi Supermarket"
        className={`w-auto object-contain transition duration-250 group-hover:scale-[1.03] ${
          compact ? 'h-12' : 'h-14 sm:h-16'
        }`}
      />
    </Link>
  )
}
