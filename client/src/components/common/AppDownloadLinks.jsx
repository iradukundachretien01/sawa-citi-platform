import { brand } from '../../utils/brand.config'

const appStores = [
  {
    label: 'Download on the App Store',
    href: brand.socialLinks.appStore,
    image: '/appstore-badge.svg',
  },
  {
    label: 'Get it on Google Play',
    href: brand.socialLinks.googlePlay,
    image: '/googleplay-badge.svg',
  },
]

export default function AppDownloadLinks({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {appStores.map((store) => (
        <a
          key={store.label}
          href={store.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={store.label}
          className="rounded-lg transition duration-200 hover:-translate-y-0.5 hover:opacity-90"
        >
          <img src={store.image} alt={store.label} className="h-11 w-auto sm:h-12" />
        </a>
      ))}
    </div>
  )
}
