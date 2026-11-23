import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  ClipboardList,
  CreditCard,
  Download,
  Headphones,
  MapPin,
  PackageCheck,
  PiggyBank,
  ShoppingBasket,
  Smartphone,
} from 'lucide-react'
import InstallApp from '../../components/common/InstallApp'
import PageHeader from '../../components/common/PageHeader'
import { brand } from '../../utils/brand.config'

const appFeatures = [
  {
    icon: ShoppingBasket,
    title: 'Browse and order',
    text: 'Shop Sawa Citi products in the app and choose delivery or collection.',
  },
  {
    icon: PackageCheck,
    title: 'Track your order',
    text: 'Follow order progress and check status updates from your phone.',
  },
  {
    icon: ClipboardList,
    title: 'Repeat your weekly shop',
    text: 'Use our reusable weekly list to plan your next shop faster.',
  },
  {
    icon: Headphones,
    title: 'Support when you need it',
    text: 'Reach the team on WhatsApp or send a message through the contact page.',
  },
]

const appAdvantages = [
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
        title="Get the Sawa Citi app"
        description="Install our own app on your phone and shop from anywhere. It works on Android and iPhone — no app store required."
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
              Sawa Citi mobile app
            </span>
            <h2 className="mt-2 font-display text-xl font-extrabold sm:text-2xl">
              Put Sawa Citi on your home screen
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Install the app in seconds and open it like any other app on your phone. Your cart,
              orders and account stay with you.
            </p>
            <InstallApp className="mt-5" />
          </div>
          <div className="rounded-card border border-white/15 bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <img src="/icons/icon-192.png" alt="Sawa Citi app icon" className="h-16 w-16 rounded-2xl bg-white p-1" />
              <div>
                <p className="font-display text-sm font-bold">{brand.name}</p>
                <p className="text-xs text-white/70">Fresh Market</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/70">
              One app for shopping, order tracking, weekly lists and support.
            </p>
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
        <h2 className="section-title">Why install it</h2>
        <p className="mt-1 text-sm text-muted">
          The app gives you the same control over price, planning and payment as the website.
        </p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {appAdvantages.map((item) => {
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
          <h2 className="font-display text-base font-bold text-ink">How to install</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            On Chrome for Android, tap “Install Sawa Citi app” above or use the browser menu and
            choose “Install app”. On iPhone or iPad, open this page in Safari, tap Share, then “Add to
            Home Screen”.
          </p>
          <a
            href={typeof window !== 'undefined' ? window.location.origin : '/'}
            className="btn-outline mt-4 text-xs"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Open the app link
          </a>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-base font-bold text-ink">Need a hand?</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Our team can help with orders, delivery, product questions and installing the app.
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
