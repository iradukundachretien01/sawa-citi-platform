import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  ClipboardList,
  CreditCard,
  Headphones,
  MapPin,
  PackageCheck,
  PiggyBank,
  ShoppingBasket,
  Smartphone,
  Store,
} from 'lucide-react'
import AppDownloadLinks from '../../components/common/AppDownloadLinks'
import PageHeader from '../../components/common/PageHeader'
import { brand } from '../../utils/brand.config'

const appFeatures = [
  {
    icon: ShoppingBasket,
    title: 'Browse and order',
    text: 'Shop Sawa Citi products through the Isokko app and choose delivery or collection.',
  },
  {
    icon: PackageCheck,
    title: 'Track your order',
    text: 'Follow order progress and check status updates from your phone.',
  },
  {
    icon: ClipboardList,
    title: 'Repeat your weekly shop',
    text: 'Use our reusable weekly list on the site to plan faster next time.',
  },
  {
    icon: Headphones,
    title: 'Support when you need it',
    text: 'Reach the team on WhatsApp or send a message through the contact page.',
  },
]

const siteAdvantages = [
  {
    icon: PiggyBank,
    title: 'Biggest savings first',
    text: 'Sort by real RWF savings and use quick budget filters to find value faster.',
  },
  {
    icon: BadgeCheck,
    title: 'Server-verified prices',
    text: 'Discounts and totals are checked by the server when your order is placed.',
  },
  {
    icon: CreditCard,
    title: 'Pay with MTN MoMo',
    text: 'When live payments are enabled, approve the request from your own wallet.',
  },
  {
    icon: ClipboardList,
    title: 'Substitution control',
    text: 'Tell us whether to ask, allow a similar item, or skip items that are unavailable.',
  },
]

export default function GetAppPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Mobile app"
        title="Get the app"
        description="Sawa Citi is available on Isokko. Download the app from the App Store or Google Play and shop from anywhere."
        actions={
          <Link to="/shop" className="btn-primary">
            Shop on the website
          </Link>
        }
      />

      <section className="mt-6 rounded-card bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6 text-white shadow-lift sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-300">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Isokko mobile app
            </span>
            <h2 className="mt-2 font-display text-xl font-extrabold sm:text-2xl">
              Download it on your device
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Open the store link below to find Sawa Citi, or use the website from any browser — your
              cart, orders and account stay with you.
            </p>
            <AppDownloadLinks className="mt-5" />
          </div>
          <div className="rounded-card border border-white/15 bg-white/10 p-5">
            <p className="font-display text-sm font-bold">Prefer your browser?</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/70">
              No install needed. Shop, track orders and save a weekly list right here.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/shop" className="btn-accent py-2 text-xs">
                Browse products
              </Link>
              <Link to="/track" className="btn border border-white/30 text-xs text-white hover:bg-white/10">
                Track an order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="section-title">What you can do</h2>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {appFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-sm font-bold text-ink">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{feature.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="section-title">More tools on the website</h2>
        <p className="mt-1 text-sm text-muted">
          The app is convenient; the website gives you extra control over price, planning and
          payment.
        </p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {siteAdvantages.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-sm font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-base font-bold text-ink">Shop on Isokko</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            The app links open the Isokko store where Sawa Citi is listed. Product availability and
            prices shown in the app are managed there.
          </p>
          <a
            href={brand.socialLinks.store}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-4 text-xs"
          >
            <Store className="h-4 w-4" aria-hidden="true" />
            Open the store
          </a>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-base font-bold text-ink">Need a hand?</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Our team can help with orders, delivery and product questions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={brand.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-2 text-xs"
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              WhatsApp support
            </a>
            <Link to="/contact" className="btn-outline py-2 text-xs">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
