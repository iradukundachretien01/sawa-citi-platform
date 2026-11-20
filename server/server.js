const app = require('./app')
const { connectDB, disconnectDB } = require('./config/db')
const { env } = require('./config/env')

async function start() {
  await connectDB()

  if (env.SEED_DEMO) {
    const User = require('./models/User')
    if ((await User.estimatedDocumentCount()) === 0) {
      const { seedDemoData } = require('./seed/seed')
      await seedDemoData()
    }
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Sawa Citi API listening on http://localhost:${env.PORT}`)
  })

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error)
})

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
