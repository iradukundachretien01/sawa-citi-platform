import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { brand } from '../../utils/brand.config'
import { FacebookIcon, InstagramIcon, XIcon } from '../common/SocialIcons'
import Logo from './Logo'

const CURRENT_YEAR = new Date().getFullYear()

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Product Gallery', to: '/gallery' },
  { label: 'Special Offers', to: '/shop?offers=true' },
  { label: 'Contact Us', to: '/contact' },
]

const helpLinks = [
  { label: 'Get the App', to: '/get-app' },
  { label: 'Weekly Shopping List', to: '/weekly-list' },
  { label: 'Track Order', to: '/track' },
  { label: 'Delivery & Collection', to: '/services' },
  { label: 'Frequently Asked Questions', to: '/faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
]

export default function Footer() {
  const { categories } = useCategories()
  const whatsappNumber = brand.phone.replace(/\D/g, '')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Sawa Citi, I need help with an order.')}`
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.location)}`

  return (
    <footer id="contact" className="mt-16 scroll-mt-28 bg-brand-900 text-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo compact light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Fresh products, everyday essentials and friendly service — your trusted supermarket in
            Rwanda.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[
              { icon: FacebookIcon, label: 'Facebook', href: brand.socialLinks.facebook },
              { icon: InstagramIcon, label: 'Instagram', href: brand.socialLinks.instagram },
              { icon: XIcon, label: 'X', href: brand.socialLinks.x },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-accent-400 hover:text-brand-900"
              >
                <social.icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Sawa Citi on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-accent-400 hover:text-brand-900"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <Link
            to="/get-app"
            className="mt-4 inline-flex text-xs font-semibold text-accent-300 transition hover:text-white"
          >
            Install our Sawa Citi app
          </Link>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent-300">
            Shop
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {categories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="transition hover:text-accent-300"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent-300">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-accent-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wider text-accent-300">
            Help
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {helpLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-accent-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent-300">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 transition hover:text-accent-300"
              >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                <span>{brand.location}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="flex items-start gap-2.5 transition hover:text-accent-300"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                {brand.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${brand.email}`}
                className="flex items-start gap-2.5 transition hover:text-accent-300"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                {brand.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              {brand.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {CURRENT_YEAR} Sawa Citi. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Some product listings and prices are sample data. Confirm current stock and prices with your branch.
          </p>
        </div>
      </div>
    </footer>
  )
}
