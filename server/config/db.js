const mongoose = require('mongoose')
const { env, isProduction } = require('./env')

let memoryServer = null

async function connectDB() {
  let uri = env.MONGO_URI

  if (!uri) {
    if (isProduction && !env.ALLOW_EPHEMERAL_DB) {
      throw new Error('MONGO_URI is required in production')
    }
    const { MongoMemoryServer } = require('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create()
    uri = memoryServer.getUri()
    console.log(
      isProduction
        ? 'Using ephemeral public demo database (data resets on restart).'
        : 'Using in-memory MongoDB for development (data resets on restart).',
    )
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  console.log(`MongoDB connected: ${mongoose.connection.host}`)
  return mongoose.connection
}

async function disconnectDB() {
  await mongoose.disconnect()
  if (memoryServer) {
    await memoryServer.stop()
    memoryServer = null
  }
}

module.exports = { connectDB, disconnectDB }
