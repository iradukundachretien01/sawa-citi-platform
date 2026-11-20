const bcrypt = require('bcryptjs')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE,
} = require('../utils/tokens')

const issueSession = (res, user) => {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  setRefreshCookie(res, refreshToken)
  return accessToken
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    throw ApiError.conflict('An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: 'customer',
  })

  const accessToken = issueSession(res, user)
  res.status(201).json({ success: true, data: { user, accessToken } })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password')
  }
  if (user.status !== 'active') {
    throw ApiError.forbidden('This account has been suspended')
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const accessToken = issueSession(res, user)
  res.json({ success: true, data: { user, accessToken } })
})

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) {
    throw ApiError.unauthorized('No active session')
  }

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    clearRefreshCookie(res)
    throw ApiError.unauthorized('Your session has expired. Please log in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user || user.status !== 'active') {
    clearRefreshCookie(res)
    throw ApiError.unauthorized('Account not found or suspended')
  }
  if ((user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
    clearRefreshCookie(res)
    throw ApiError.unauthorized('Your session is no longer valid. Please log in again.')
  }

  const accessToken = issueSession(res, user)
  res.json({ success: true, data: { user, accessToken } })
})

const logout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res)
  res.json({ success: true, message: 'Logged out' })
})

const me = asyncHandler(async (req, res) => {
  await req.user.populate('wishlist', 'name slug images price discountPrice')
  res.json({ success: true, data: { user: req.user } })
})

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+passwordHash')

  const matches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!matches) {
    throw ApiError.badRequest('Your current password is incorrect')
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()

  const accessToken = issueSession(res, user)
  res.json({ success: true, message: 'Password updated', data: { user, accessToken } })
})

module.exports = { register, login, refresh, logout, me, updatePassword }
