import { useMemo, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { galleryCategories, productGallery } from '../../data/productGallery'

export default function ProductGallerySection() {
  const [active, setActive] = useState('all')

  const items = useMemo(
    () =>
      active === 'all'
        ? productGallery
        : productGallery.filter((item) => item.category === active),
    [active],
  )

  return (
    <section id="product-gallery" className="container-page mt-12 scroll-mt-28 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">In-store range</p>
          <h2 className="section-title mt-1">More Products at Sawa Citi</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Explore a wider selection of products you can find at Sawa Citi — from wines and spirits to
            deli, snacks, household and personal care. Availability may vary by branch.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
          <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {items.length} items
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {galleryCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            className={`rounded-pill px-3.5 py-2 text-xs font-semibold transition ${
              active === cat.id
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-white text-ink/70 hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <article key={item.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
            <div className="relative aspect-square overflow-hidden bg-brand-50">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-2.5 top-2.5 rounded-pill bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 shadow-soft backdrop-blur">
                {item.tag}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-display text-sm font-bold leading-snug text-ink">{item.name}</h3>
              <p className="mt-1 text-[11px] font-medium text-muted">Available at Sawa Citi branches</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
