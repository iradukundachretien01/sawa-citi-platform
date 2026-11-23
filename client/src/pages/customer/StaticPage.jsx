import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Store,
  Truck,
  Users,
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { useBranches } from '../../hooks/useBranches'
import { brand } from '../../utils/brand.config'

const aboutStats = [
  { label: 'Branches in Kigali', value: '3' },
  { label: 'Product lines', value: '35+' },
  { label: 'Daily opening', value: '06:45' },
  { label: 'Closing time', value: '22:45' },
]

const values = [
  {
    icon: BadgeCheck,
    title: 'Freshness first',
    text: 'Produce and perishables are checked daily, with clear stock visibility per branch.',
  },
  {
    icon: ShieldCheck,
    title: 'Fair, transparent prices',
    text: 'Prices are validated on the server at checkout, so what you see is what you pay.',
  },
  {
    icon: Users,
    title: 'Community focused',
    text: 'Friendly service and local sourcing designed around Rwandan households and businesses.',
  },
]

const services = [
  {
    icon: Truck,
    title: 'Home delivery',
    text: 'Order online and get groceries delivered across Kigali. Delivery fees are shown per branch before you confirm.',
  },
  {
    icon: Store,
    title: 'Branch collection',
    text: 'Choose a nearby branch, skip delivery fees and collect when your order is ready.',
  },
  {
    icon: ShoppingBasket,
    title: 'Bulk & business orders',
    text: 'Restaurants, schools and offices can place larger orders. Contact us for tailored support.',
  },
  {
    icon: CreditCard,
    title: 'Flexible payments',
    text: 'Demo test payments and cash on delivery are enabled today. Mobile money and cards are ready to plug in.',
  },
  {
    icon: Smartphone,
    title: 'Mobile shopping',
    text: 'Install our own Sawa Citi app on your phone, or shop here from any browser.',
  },
]

const faqs = [
  {
    q: 'Are all product prices and stock levels current?',
    a: 'Product availability and prices depend on the selected branch and are confirmed at checkout. Contact your branch to confirm current availability before visiting.',
  },
  {
    q: 'How does delivery work?',
    a: 'Choose delivery at checkout, pick a branch and enter your address. The branch delivery fee is added to your order before confirmation.',
  },
  {
    q: 'Can I collect my order?',
    a: 'Yes. Select collection at checkout. You will not be charged a delivery fee. Wait for the ready status before visiting the branch.',
  },
  {
    q: 'How do I track an order?',
    a: 'Use the Track Order page with your order number, or open the order from your account. Status updates are recorded as the order progresses.',
  },
  {
    q: 'What payment methods are available?',
    a: 'Cash on delivery is available where supported by your branch. Electronic payment options appear at checkout when enabled.',
  },
  {
    q: 'Can I shop from a mobile app?',
    a: 'Yes. Install our own Sawa Citi app from the Get the App page — it works on Android and iPhone with no app store needed. You can also use this website from any phone browser.',
  },
  {
    q: 'Can I cancel an order?',
    a: 'Orders that are still pending or processing can be cancelled from the order detail page. Reserved stock is returned to the branch.',
  },
  {
    q: 'How do I leave a review?',
    a: 'Sign in, open a product and submit a rating and comment. Reviews are subject to moderation.',
  },
]

const privacySections = [
  {
    title: 'What we collect',
    body: 'Account details you provide (name, email, phone), order and delivery information, and basic usage data needed to operate the storefront.',
  },
  {
    title: 'How we use it',
    body: 'To create your account, process orders, arrange delivery or collection, provide support and improve the shopping experience.',
  },
  {
    title: 'Payments',
    body: 'Never share your card number or security code outside an approved payment provider. Electronic payment options are shown at checkout only when available.',
  },
  {
    title: 'Data retention',
    body: 'Account and order information is retained only as needed to provide service and meet applicable legal obligations. Contact Sawa Citi for privacy requests.',
  },
  {
    title: 'Your choices',
    body: 'You can update your password, clear your local wishlist and cart, or contact us to request account removal.',
  },
]

const termsSections = [
  {
    title: 'Prices and availability',
    body: 'Product availability and prices are confirmed for the selected branch at checkout. Contact your branch for current product availability.',
  },
  {
    title: 'Accounts',
    body: 'Keep your credentials secure. You are responsible for activity under your account.',
  },
  {
    title: 'Orders and pricing',
    body: 'Prices are confirmed on the server at checkout. If an item becomes unavailable, the order may fail and reserved stock is released automatically.',
  },
  {
    title: 'Payments',
    body: 'Use only payment methods presented at checkout. Never send payment credentials by email or social media.',
  },
  {
    title: 'Acceptable use',
    body: 'Do not attempt to disrupt the service or access other users’ data.',
  },
]

export default function StaticPage({ page }) {
  const { branches } = useBranches()
  const [contact, setContact] = useState({ name: '', email: '', message: '' })
  const [contactNotice, setContactNotice] = useState('')

  if (page === 'contact') {
    return (
      <div className="container-page py-8 sm:py-10">
        <PageHeader
          eyebrow="Contact"
          title="Talk to Sawa Citi"
          description="Questions about an order, a branch or a bulk purchase? Send us a message or contact the team directly."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold text-ink">Get in touch</h2>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="hover:text-brand-700">
                    {brand.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <a href={`mailto:${brand.email}`} className="hover:text-brand-700">
                    {brand.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {brand.location}
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {brand.hours}
                </li>
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-lg font-bold text-ink">Branches</h2>
              <ul className="mt-3 space-y-2">
                {branches.map((branch) => (
                  <li key={branch._id || branch.code} className="rounded-xl bg-brand-50 p-3 text-sm">
                    <p className="font-semibold text-brand-800">{branch.name}</p>
                    <p className="text-xs text-muted">
                      {branch.address} · {branch.openingHours}
                    </p>
                    {branch.phone && <p className="text-xs text-muted">{branch.phone}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form
            className="card h-fit p-5"
            onSubmit={(event) => {
              event.preventDefault()
              const subject = `Website enquiry from ${contact.name.trim()}`
              const body = [
                `Name: ${contact.name.trim()}`,
                `Email: ${contact.email.trim()}`,
                '',
                contact.message.trim(),
              ].join('\n')
              window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              setContactNotice(
                `Your email app should open. If it does not, email ${brand.email} directly.`,
              )
            }}
          >
            <h2 className="font-display text-lg font-bold text-ink">Send a message</h2>
            <div className="mt-3 space-y-3">
              <label className="block text-xs font-semibold text-muted">
                Name
                <input
                  value={contact.name}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  required
                />
              </label>
              <label className="block text-xs font-semibold text-muted">
                Email
                <input
                  type="email"
                  value={contact.email}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, email: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  required
                />
              </label>
              <label className="block text-xs font-semibold text-muted">
                Message
                <textarea
                  rows={5}
                  value={contact.message}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, message: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  required
                />
              </label>
              {contactNotice && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                  {contactNotice}
                </p>
              )}
              <button type="submit" className="btn-primary w-full py-3">
                Send message
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (page === 'faq') {
    return (
      <div className="container-page py-8 sm:py-10">
        <PageHeader
          eyebrow="Help"
          title="Frequently asked questions"
          description="Everything you need to know about shopping, delivery, collection and payments."
        />
        <div className="mt-6 max-w-3xl space-y-2.5">
          {faqs.map((faq) => (
            <details key={faq.q} className="card group p-4">
              <summary className="cursor-pointer list-none font-display text-sm font-bold text-ink marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {faq.q}
                  <span className="text-brand-600 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 rounded-card bg-brand-50 p-5">
          <p className="font-display text-sm font-bold text-brand-800">Still need help?</p>
          <p className="mt-1 text-sm text-brand-700">
            Call {brand.phone} or{' '}
            <Link to="/contact" className="font-semibold underline">
              send us a message
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  if (page === 'privacy' || page === 'terms') {
    const sections = page === 'privacy' ? privacySections : termsSections
    return (
      <div className="container-page py-8 sm:py-10">
        <PageHeader
          eyebrow={page === 'privacy' ? 'Legal' : 'Legal'}
          title={page === 'privacy' ? 'Privacy policy' : 'Terms of use'}
          description={
            page === 'privacy'
              ? 'How account and order information is handled.'
              : 'Terms for using Sawa Citi online services.'
          }
        />
        <div className="mt-6 max-w-3xl space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="card p-5">
              <h2 className="font-display text-base font-bold text-ink">{section.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
          <p className="text-xs text-muted">
            These pages require review by Sawa Citi before publication as final legal terms.
          </p>
        </div>
      </div>
    )
  }

  if (page === 'services') {
    return (
      <div className="container-page py-8 sm:py-10">
        <PageHeader
          eyebrow="Services"
          title="Shopping that fits your day"
          description="Delivery, collection and business support backed by real-time branch stock."
          actions={
            <Link to="/shop" className="btn-primary">
              Start shopping
            </Link>
          }
        />
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div key={service.title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-3 font-display text-base font-bold text-ink">{service.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{service.text}</p>
              </div>
            )
          })}
        </div>

        <section className="mt-8 card p-5">
          <h2 className="font-display text-lg font-bold text-ink">Our branches</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {branches.map((branch) => (
              <div key={branch._id || branch.code} className="rounded-xl bg-brand-50 p-3.5 text-sm">
                <p className="font-semibold text-brand-800">{branch.name}</p>
                <p className="mt-0.5 text-xs text-muted">{branch.address}</p>
                <p className="text-xs text-muted">{branch.openingHours}</p>
                <p className="mt-1 text-xs font-semibold text-brand-700">
                  {branch.supportsDelivery ? 'Delivery' : 'No delivery'} ·{' '}
                  {branch.supportsCollection ? 'Collection' : 'No collection'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="About us"
        title="Fresh products, great prices, trusted service"
        description="Sawa Citi is built around a simple idea: everyday shopping should be fresh, fair and convenient for every household in Rwanda."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink">Our story</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            What started as a neighbourhood supermarket has grown into a modern retail experience.
            This platform brings the shelves online: browse fresh produce and household essentials,
            check stock at your nearest branch, then choose delivery or collection.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The demo showcases a complete commerce flow — server-validated pricing, atomic stock
            reservation, order tracking, reviews and staff dashboards — designed to be extended with
            real payment providers and production data.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {aboutStats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-brand-50 p-3 text-center">
                <p className="font-display text-xl font-extrabold text-brand-700">{stat.value}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <img src="/demo/hero.jpg" alt="Fresh market produce" className="h-52 w-full object-cover" />
          <div className="p-5">
            <h2 className="font-display text-base font-bold text-ink">Visit us</h2>
            <p className="mt-1 text-sm text-muted">
              {brand.location} · {brand.hours}
            </p>
            <Link to="/contact" className="btn-outline mt-3 w-full text-xs">
              Contact & branches
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="section-title">What we stand for</h2>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div key={value.title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-ink">{value.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{value.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-8 rounded-card bg-brand-800 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-extrabold">Ready to shop?</h2>
            <p className="mt-1 text-sm text-white/70">
              Browse the full catalogue and choose delivery or collection at checkout.
            </p>
          </div>
          <Link to="/shop" className="btn-accent">
            Shop now
          </Link>
        </div>
      </section>
    </div>
  )
}
