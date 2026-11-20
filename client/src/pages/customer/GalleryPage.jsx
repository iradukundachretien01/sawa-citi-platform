import { MessageCircle, Phone } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import ProductGallerySection from '../../components/home/ProductGallerySection'
import { brand } from '../../utils/brand.config'

export default function GalleryPage() {
  const whatsappNumber = brand.phone.replace(/\D/g, '')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello Sawa Citi, I would like to ask if a product is available.',
  )}`

  return (
    <div className="pb-4">
      <div className="container-page pt-8 sm:pt-10">
        <PageHeader
          eyebrow="Sawa Citi range"
          title="Product Gallery"
          description="A broader look at items sold at Sawa Citi — beverages, deli, pantry, household and personal care products beyond what is listed in the online shop. Availability may vary by branch."
        />
      </div>
      <ProductGallerySection />

      <section className="container-page mt-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink">Looking for something specific?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Sawa Citi stocks thousands of items across its branches. If you can’t find a product in the
              gallery or online shop, contact us to check current availability and pricing.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Ask on WhatsApp
              </a>
              <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="btn-outline">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call a branch
              </a>
            </div>
          </div>
          <div className="card bg-brand-50 p-5">
            <h2 className="font-display text-lg font-bold text-brand-900">In-store highlights</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-brand-800">
              <li className="rounded-lg bg-white/70 px-3 py-2 font-medium">Imported wines & spirits</li>
              <li className="rounded-lg bg-white/70 px-3 py-2 font-medium">Dairyland ice cream</li>
              <li className="rounded-lg bg-white/70 px-3 py-2 font-medium">Fresh deli & butchery</li>
              <li className="rounded-lg bg-white/70 px-3 py-2 font-medium">Pantry & breakfast items</li>
              <li className="rounded-lg bg-white/70 px-3 py-2 font-medium">Cleaning & household</li>
              <li className="rounded-lg bg-white/70 px-3 py-2 font-medium">Personal & baby care</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
