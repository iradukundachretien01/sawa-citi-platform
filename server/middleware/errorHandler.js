const { isProduction } = require('../config/env')
const ApiError = require('../utils/ApiError')

const errorHandler = (error, _req, res, _next) => {
  let statusCode = 500
  let message = 'Something went wrong. Please try again.'
  let errors

  if (error instanceof ApiError) {
    statusCode = error.statusCode
    message = error.message
    errors = error.errors
  } else if (error.name === 'ValidationError' && error.errors) {
    statusCode = 400
    message = 'Validation failed'
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }))
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = `Invalid value for ${error.path}`
  } else if (error.name === 'MulterError') {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Import file must be 5 MB or smaller'
        : 'Import file could not be uploaded'
  } else if (error.code === 11000) {
    statusCode = 409
    const field = Object.keys(error.keyValue || {})[0] || 'field'
    message = `A record with this ${field} already exists`
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid authentication token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Your session has expired. Please log in again.'
  } else {
    console.error('Unhandled error:', error)
  }

  const payload = { success: false, message }
  if (errors) payload.errors = errors
  if (!isProduction && statusCode >= 500) payload.stack = error.stack

  res.status(statusCode).json(payload)
}

module.exports = errorHandler
