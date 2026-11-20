import { orderStatusLabels, paymentStatusLabels } from '../../lib/normalize'

const orderColors = {
  pending: 'bg-accent-100 text-brand-900',
  processing: 'bg-brand-100 text-brand-800',
  ready: 'bg-sky-100 text-sky-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-brand-600 text-white',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentColors = {
  pending: 'bg-accent-100 text-brand-900',
  paid: 'bg-brand-600 text-white',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-black/10 text-ink',
}

export default function StatusBadge({ status, kind = 'order' }) {
  const labels = kind === 'payment' ? paymentStatusLabels : orderStatusLabels
  const colors = kind === 'payment' ? paymentColors : orderColors

  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-bold ${
        colors[status] || 'bg-black/5 text-ink'
      }`}
    >
      {labels[status] || status}
    </span>
  )
}
