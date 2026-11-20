const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const compression = require('compression')
const hpp = require('hpp')
const { env, isProduction } = require('./config/env')
const { sanitize } = require('./middleware/sanitize')
const { globalLimiter } = require('./middleware/rateLimit')
const apiRoutes = require('./routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.set('trust proxy', 1)

const allowedOrigins = new Set(
  env.CLIENT_URL.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)

if (!isProduction) {
  allowedOrigins.add('http://localhost:5173')
  allowedOrigins.add('http://127.0.0.1:5173')
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }
      return callback(null, false)
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())
app.use(sanitize)
app.use(hpp())
app.use(compression())

if (!isProduction) {
  app.use(morgan('dev'))
}

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  })
})

app.use('/api', globalLimiter, apiRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
