import { Link } from 'react-router-dom'
import { ArrowRight, BadgePercent, Leaf, Star } from 'lucide-react'

export default function HeroSection() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="home" className="container-page pt-5 sm:pt-7">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-50 via-[#F3F8EF] to-[#FBF7E8] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-200/50 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-accent-200/40 blur-2xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-pill bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 shadow-soft">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
              Welcome to Sawa Citi
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
              Fresh Products,
              <span className="relative ml-2 inline-block text-brand-600">
                Great Prices.
                <svg
                  className="absolute -bottom-2 left-0 h-2.5 w-full text-accent-400"
                  viewBox="0 0 200 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7c40-5 80-6 120-4 26 1 52 3 76 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Your Trusted Supermarket in Rwanda. Shop everyday essentials, fresh produce and
              household favourites — delivered to your door or ready for collection.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="btn-accent px-6 py-3 text-sm">
                Shop Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('categories')}
                className="btn-outline px-6 py-3"
              >
                Browse Categories
              </button>
              <Link to="/gallery" className="btn-outline px-6 py-3">
                Product Gallery
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-muted">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                4.8 customer rating
              </span>
              <span className="h-4 w-px bg-black/10" aria-hidden="true" />
              <span>3 branches in Kigali</span>
              <span className="h-4 w-px bg-black/10" aria-hidden="true" />
              <span>Same-day delivery</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[32px] border-4 border-white/80 bg-brand-100 shadow-lift">
              <img
                src="/demo/hero.jpg"
                alt="Fresh produce and groceries at Sawa Citi"
                className="h-64 w-full object-cover sm:h-80 lg:h-[360px]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/25 via-transparent to-transparent" />
            </div>

            <div className="absolute -right-2 top-4 flex h-24 w-24 rotate-6 flex-col items-center justify-center rounded-full bg-accent-400 text-center shadow-lift sm:-right-4 sm:h-28 sm:w-28">
              <BadgePercent className="h-5 w-5 text-brand-900" aria-hidden="true" />
              <span className="mt-0.5 font-display text-sm font-extrabold leading-tight text-brand-900">
                Save
                <br />
                More!
              </span>
            </div>

            <div className="absolute -bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-3 shadow-soft backdrop-blur sm:left-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Today only</p>
              <p className="font-display text-sm font-bold text-brand-800">Up to 30% OFF</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
