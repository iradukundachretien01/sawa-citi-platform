import { Headphones, ShieldCheck, Tag, Truck } from 'lucide-react'
import { features } from '../../data/demo'

const icons = {
  truck: Truck,
  shield: ShieldCheck,
  support: Headphones,
  tag: Tag,
}

export default function TrustStrip() {
  return (
    <section id="services" className="container-page mt-12 scroll-mt-28 sm:mt-16">
      <div className="grid grid-cols-1 gap-3 rounded-card border border-brand-100 bg-brand-50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = icons[feature.icon] ?? Tag
          return (
            <div key={feature.title} className="flex items-center gap-3 rounded-xl bg-white/60 p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-brand-900">{feature.title}</p>
                <p className="truncate text-xs text-muted">{feature.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
