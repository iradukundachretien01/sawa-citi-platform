import { useEffect, useState } from 'react'
import { api } from '../lib/api'

let cache = null

export function useBranches() {
  const [branches, setBranches] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let cancelled = false

    api
      .get('/branches')
      .then(({ data }) => {
        if (cancelled) return
        cache = data.data || []
        setBranches(cache)
      })
      .catch(() => {
        if (!cancelled) setBranches([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { branches, loading }
}
