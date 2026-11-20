const express = require('express')
const {
  register,
  login,
  refresh,
  logout,
  me,
  updatePassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const { validate } = require('../middleware/validate')
const { registerSchema, loginSchema, updatePasswordSchema } = require('../validators/schemas')

const router = express.Router()

router.post('/register', authLimiter, validate({ body: registerSchema }), register)
router.post('/login', authLimiter, validate({ body: loginSchema }), login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', protect, me)
router.patch('/password', protect, validate({ body: updatePasswordSchema }), updatePassword)

module.exports = router
