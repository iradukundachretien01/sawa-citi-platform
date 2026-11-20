import { Link } from 'react-router-dom'
import { Heart, ListPlus, Plus, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useStore } from '../../context/StoreContext'
import { formatRwf } from '../../utils/formatRwf'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { wishlist, toggleWishlist, weeklyList, addToWeeklyList, removeFromWeeklyList } = useStore()
  const saved = wishlist.includes(product.id)
  const inWeeklyList =
    weeklyList.includes(product.id) || weeklyList.includes(product.slug)

  return (
    <article className="group card flex flex-col overflow-hidden transition duration-250 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-40 overflow-hidden bg-brand-50 sm:h-44">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-pill px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              product.badge.startsWith('-')
                ? 'bg-accent-400 text-brand-900'
                : 'bg-brand-600 text-white'
            }`}
          >
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
          }
          aria-pressed={saved}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110 ${
            saved ? 'text-brand-600' : 'text-ink/50 hover:text-brand-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-brand-600' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted">
          <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
          {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
          <span className="font-normal text-muted/60">· {product.unit}</span>
        </div>

        <h3 className="font-display text-sm font-bold leading-snug text-ink">
          <Link to={`/product/${product.slug}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-display text-base font-extrabold text-brand-700">
            {formatRwf(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs font-medium text-muted/60 line-through">
              {formatRwf(product.oldPrice)}
            </span>
          )}
        </div>

        {product.savingsAmount > 0 && (
          <p className="text-[11px] font-bold text-brand-700">
            Save {formatRwf(product.savingsAmount)}
          </p>
        )}

        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-pill border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 transition hover:border-brand-600 hover:bg-brand-600 hover:text-white active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => {
            if (inWeeklyList) {
              removeFromWeeklyList(product.id)
              removeFromWeeklyList(product.slug)
            } else {
              addToWeeklyList(product.id)
            }
          }}
          aria-pressed={inWeeklyList}
          className="inline-flex items-center justify-center gap-1.5 rounded-pill px-3 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          <ListPlus className="h-3.5 w-3.5" aria-hidden="true" />
          {inWeeklyList ? 'Remove from weekly list' : 'Save for weekly shop'}
        </button>
      </div>
    </article>
  )
}
