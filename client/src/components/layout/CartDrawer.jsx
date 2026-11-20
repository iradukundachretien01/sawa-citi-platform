import { useNavigate } from 'react-router-dom'
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatRwf } from '../../utils/formatRwf'

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()

  if (!isOpen) return null

  const startShopping = () => {
    closeCart()
    navigate('/shop')
  }

  const checkout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative flex h-full w-full max-w-md animate-slide-in flex-col bg-white shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Your Cart</h2>
              <p className="text-xs text-muted">{items.length} product type(s)</p>
            </div>
          </div>
          <button type="button" onClick={closeCart} className="icon-btn" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-400">
              <ShoppingBag className="h-8 w-8" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted">Add some fresh favourites to get started.</p>
            <button type="button" onClick={startShopping} className="btn-primary mt-5">
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-black/5 p-2.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-bold text-ink">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-muted">{item.unit}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted/60 transition hover:text-red-500"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-pill border border-black/10">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-ink/70 hover:bg-brand-50"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-ink/70 hover:bg-brand-50"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-brand-700">
                        {formatRwf(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-muted underline-offset-2 hover:text-red-500 hover:underline"
              >
                Clear cart
              </button>
            </div>

            <div className="border-t border-black/5 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-display text-lg font-extrabold text-ink">
                  {formatRwf(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Delivery calculated at checkout based on your branch.
              </p>

              <button type="button" onClick={checkout} className="btn-primary mt-3 w-full py-3">
                Proceed to Checkout
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                Secure checkout · Demo store, no real payments
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
