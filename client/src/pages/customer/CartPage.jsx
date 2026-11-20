import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import { useCart } from '../../context/CartContext'
import { formatRwf } from '../../utils/formatRwf'

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <PageHeader eyebrow="Cart" title="Your cart" />
        <div className="mt-6">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse fresh produce, groceries and household essentials, then add them here."
            action={
              <Link to="/shop" className="btn-primary">
                Start shopping
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Cart"
        title="Your cart"
        description={`${items.length} product line(s) ready for checkout. Prices are confirmed by the server when you place the order.`}
        actions={
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear cart
          </button>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link
                to={`/product/${item.slug}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50 sm:h-24 sm:w-24"
              >
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-bold text-ink sm:text-base">
                      <Link to={`/product/${item.slug}`} className="hover:text-brand-700">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatRwf(item.price)} {item.unit ? `· ${item.unit}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="inline-flex items-center rounded-pill border border-black/10 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 hover:bg-brand-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 hover:bg-brand-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-display text-sm font-extrabold text-brand-700">
                    {formatRwf(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
            Continue shopping
          </Link>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatRwf(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-xs text-muted">Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Discounts</dt>
              <dd className="text-xs text-muted">Promo codes applied at checkout</dd>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
              <dt className="font-semibold text-ink">Estimated total</dt>
              <dd className="font-display text-xl font-extrabold text-brand-700">
                {formatRwf(subtotal)}
              </dd>
            </div>
          </dl>

          <Link to="/checkout" className="btn-primary mt-5 w-full py-3">
            Proceed to checkout
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="mt-4 space-y-2 text-xs text-muted">
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Delivery across Kigali or free branch collection.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Secure checkout. Test payments only in this demo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
