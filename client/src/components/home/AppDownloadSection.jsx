import { Link } from 'react-router-dom'
import { ArrowRight, Headphones, ShoppingBasket, Smartphone } from 'lucide-react'
import { brand } from '../../utils/brand.config'
import AppDownloadLinks from '../common/AppDownloadLinks'

const appFeatures = [
  { icon: ShoppingBasket, title: 'Shop on the go', text: 'Browse Sawa Citi products on Isokko.' },
  { icon: Smartphone, title: 'Order anytime', text: 'Place an order from your phone, day or night.' },
  { icon: Headphones, title: 'Get help fast', text: 'Reach our team through WhatsApp or the contact page.' },
]

export default function AppDownloadSection() {
  return (
    <section className="container-page mt-12 scroll-mt-28 sm:mt-16" id="get-app">
      <div className="overflow-hidden rounded-card bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6 text-white shadow-lift sm:p-8">
        <div className="grid items-center gap-7 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-300">
              Get the app
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Take Sawa Citi with you
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
              Find us on Isokko in the App Store or Google Play. Browse products, place orders and
              get support wherever you are.
            </p>
            <AppDownloadLinks className="mt-5" />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
              <Link to="/get-app" className="inline-flex items-center gap-1.5 hover:text-accent-300">
                See app features <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={brand.socialLinks.store}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-300"
              >
                Shop on Isokko
              </a>
            </div>
          </div>

          <div className="rounded-card border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <ul className="space-y-4">
              {appFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <li key={feature.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Icon className="h-4 w-4 text-accent-300" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold">{feature.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/70">{feature.text}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <a
              href={brand.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent mt-5 w-full py-2.5 text-xs"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
