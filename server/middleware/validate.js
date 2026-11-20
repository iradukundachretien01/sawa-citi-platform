const ApiError = require('../utils/ApiError')

const formatIssues = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }))

const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body)
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params)
    }
    if (schemas.query) {
      const parsedQuery = schemas.query.parse(req.query)
      Object.defineProperty(req, 'query', {
        value: parsedQuery,
        configurable: true,
        writable: true,
        enumerable: true,
      })
    }
    return next()
  } catch (error) {
    if (error && Array.isArray(error.issues)) {
      return next(ApiError.badRequest('Validation failed', formatIssues(error)))
    }
    return next(error)
  }
}

module.exports = { validate }
