import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const StoreContext = createContext(null)
const WISHLIST_KEY = 'sawa-citi-wishlist'
const WEEKLY_LIST_KEY = 'sawa-citi-weekly-list'

const readStoredIds = (key) => {
  try {
    const raw = window.localStorage.getItem(key)
    const ids = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function StoreProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => readStoredIds(WISHLIST_KEY))
  const [weeklyList, setWeeklyList] = useState(() => readStoredIds(WEEKLY_LIST_KEY))

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    window.localStorage.setItem(WEEKLY_LIST_KEY, JSON.stringify(weeklyList))
  }, [weeklyList])

  const toggleWishlist = useCallback((id) => {
    setWishlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }, [])

  const clearWishlist = useCallback(() => setWishlist([]), [])

  const addToWeeklyList = useCallback((id) => {
    setWeeklyList((current) => (current.includes(id) ? current : [...current, id]))
  }, [])

  const removeFromWeeklyList = useCallback((id) => {
    setWeeklyList((current) => current.filter((item) => item !== id))
  }, [])

  const clearWeeklyList = useCallback(() => setWeeklyList([]), [])

  const value = useMemo(
    () => ({
      wishlist,
      toggleWishlist,
      clearWishlist,
      isWishlisted: (id) => wishlist.includes(id),
      weeklyList,
      addToWeeklyList,
      removeFromWeeklyList,
      clearWeeklyList,
    }),
    [
      wishlist,
      toggleWishlist,
      clearWishlist,
      weeklyList,
      addToWeeklyList,
      removeFromWeeklyList,
      clearWeeklyList,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within a StoreProvider')
  return context
}
