import { PackageSearch } from 'lucide-react'

export default function EmptyState({ icon: Icon = PackageSearch, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
      <Icon className="h-10 w-10 text-brand-400" aria-hidden="true" />
      <h3 className="mt-3 font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
