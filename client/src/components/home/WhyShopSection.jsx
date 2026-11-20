import { Clock, MapPin, Phone, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { brand } from '../../utils/brand.config'

const branches = [
  { name: 'Kigali City Center', address: 'KN 4 Ave, Nyarugenge', hours: '06:45 – 22:45' },
  { name: 'Kimironko', address: 'KG 11 Ave, Gasabo', hours: '06:45 – 22:45' },
  { name: 'Remera', address: 'KG 9 Ave, Gasabo', hours: '06:45 – 22:45' },
]

const reasons = [
  { icon: Sparkles, title: 'Fresh every day', text: 'Produce, bakery and butchery restocked daily.' },
  { icon: Truck, title: 'Delivery or collection', text: 'Choose door delivery or pick up at your branch.' },
  { icon: ShieldCheck, title: 'Secure & reliable', text: 'Protected accounts and server-verified prices.' },
]

export default function WhyShopSection() {
  return (
    <section id="about" className="container-page mt-12 scroll-mt-28 sm:mt-16">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 sm:p-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Why shop with us
          </span>
          <h2 className="section-title mt-2">A better way to shop for everyday essentials</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Sawa Citi brings quality groceries, fresh produce and household favourites together at
            fair prices. Order online and get it delivered, or collect from a branch near you.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-xl bg-brand-50 p-4">
                <reason.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                <p className="mt-2 font-display text-sm font-bold text-brand-900">{reason.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{reason.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-ink">Our branches</h3>
          <p className="mt-1 text-sm text-muted">Visit us in Kigali — open every day.</p>
          <ul className="mt-4 space-y-3">
            {branches.map((branch) => (
              <li
                key={branch.name}
                className="flex items-start gap-3 rounded-xl border border-black/5 p-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-ink">{branch.name}</p>
                  <p className="text-xs text-muted">{branch.address}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {branch.hours}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <a
            href={`tel:${brand.phone.replace(/\s/g, '')}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {brand.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
