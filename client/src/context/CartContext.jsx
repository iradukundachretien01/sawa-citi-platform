import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { normalizeProduct } from '../lib/normalize'

const CartContext = createContext(null)
const STORAGE_KEY = 'sawa-citi-cart'

const readCart = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [isOpen, setIsOpen] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const addItem = useCallback((product, quantity = 1) => {
    const normalized = normalizeProduct(product)
    if (!normalized) return

    setItems((current) => {
      const existing = current.find((item) => item.id === normalized.id)
      if (existing) {
        return current.map((item) =>
          item.id === normalized.id
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item,
        )
      }
      return [
        ...current,
        {
          id: normalized.id,
          slug: normalized.slug,
          name: normalized.name,
          unit: normalized.unit,
          price: normalized.price,
          image: normalized.image,
          quantity,
        },
      ]
    })
    setNotice(`${normalized.name} added to cart`)
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, Math.min(99, quantity)) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      notice,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, count, subtotal, isOpen, notice, addItem, updateQuantity, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
