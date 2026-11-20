import { useLocation } from 'react-router-dom'
import BackButton from './BackButton'

export default function PageHeader({ eyebrow, title, description, actions }) {
  const { pathname } = useLocation()
  const fallbackTo = pathname.startsWith('/admin') ? '/admin' : '/'
  const showBack = pathname !== '/' && pathname !== '/admin'

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {showBack && <BackButton fallbackTo={fallbackTo} className="mb-2" />}
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
