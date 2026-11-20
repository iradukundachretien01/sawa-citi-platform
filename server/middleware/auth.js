const jwt = require('jsonwebtoken')
const { env } = require('../config/env')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw ApiError.unauthorized('Please log in to continue')
  }

  let payload
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please log in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Account not found or suspended')
  }

  if ((user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
    throw ApiError.unauthorized('Your session is no longer valid. Please log in again.')
  }

  req.user = user
  next()
})

module.exports = { protect }
