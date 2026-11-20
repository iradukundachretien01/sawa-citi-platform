const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const clean = (value) => {
  if (Array.isArray(value)) {
    return value.map(clean)
  }
  if (isPlainObject(value)) {
    const result = {}
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue
      result[key] = clean(nested)
    }
    return result
  }
  return value
}

const sanitize = (req, _res, next) => {
  if (req.body) req.body = clean(req.body)
  if (req.params) req.params = clean(req.params)
  next()
}

module.exports = { sanitize }
