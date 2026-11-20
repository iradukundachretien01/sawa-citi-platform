import { useEffect, useState } from 'react'
import { categories as fallbackCategories } from '../data/demo'
import { api } from '../lib/api'

let cache = null

export function useCategories() {
  const [categories, setCategories] = useState(cache || fallbackCategories)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let cancelled = false

    api
      .get('/categories')
      .then(({ data }) => {
        if (cancelled) return
        const list = data.data?.length ? data.data : fallbackCategories
        cache = list
        setCategories(list)
      })
      .catch(() => {
        if (!cancelled) setCategories(fallbackCategories)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading }
}
