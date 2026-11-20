const path = require('path')
const { z } = require('zod')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => value === true || value === 'true' || value === '1')

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  MONGO_URI: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().optional().default(''),
  JWT_REFRESH_SECRET: z.string().optional().default(''),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  PAYMENT_PROVIDER: z.enum(['mock', 'mtn_momo', 'airtel', 'card']).default('mock'),
  MOMO_BASE_URL: z.string().optional().default(''),
  MOMO_SUBSCRIPTION_KEY: z.string().optional().default(''),
  MOMO_API_USER: z.string().optional().default(''),
  MOMO_API_KEY: z.string().optional().default(''),
  MOMO_USER_ID: z.string().optional().default(''),
  MOMO_CREDENTIAL_TOKEN: z.string().optional().default(''),
  MOMO_TARGET_ENVIRONMENT: z.string().optional().default('sandbox'),
  MOMO_CURRENCY: z.string().optional().default('RWF'),
  MOMO_CALLBACK_URL: z.string().optional().default(''),
  MOMO_CALLBACK_HOST: z.string().optional().default(''),
  SEED_DEMO: booleanFromString.optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const env = {
  ...parsed.data,
  SEED_DEMO: parsed.data.SEED_DEMO ?? (parsed.data.NODE_ENV !== 'production'),
}
const isProduction = env.NODE_ENV === 'production'

if (isProduction) {
  if (env.SEED_DEMO) {
    console.error('SEED_DEMO=true is for development only; set SEED_DEMO=false in production.')
    process.exit(1)
  }

  if (env.PAYMENT_PROVIDER === 'mock') {
    console.error('PAYMENT_PROVIDER=mock is for development only; configure a real provider in production.')
    process.exit(1)
  }

  if (env.PAYMENT_PROVIDER === 'mtn_momo') {
    const hasLegacyCredentials = Boolean(env.MOMO_API_USER && env.MOMO_API_KEY)
    const hasMigratedCredentials = Boolean(env.MOMO_USER_ID && env.MOMO_CREDENTIAL_TOKEN)
    const missing = []

    if (!env.MOMO_SUBSCRIPTION_KEY) missing.push('MOMO_SUBSCRIPTION_KEY')
    if (!hasLegacyCredentials && !hasMigratedCredentials) {
      missing.push('MOMO_USER_ID and MOMO_CREDENTIAL_TOKEN')
    }
    if (!env.MOMO_CALLBACK_URL) missing.push('MOMO_CALLBACK_URL')

    if (missing.length > 0) {
      console.error(`Missing MTN MoMo configuration: ${missing.join(', ')}`)
      process.exit(1)
    }

    if (!env.MOMO_CALLBACK_URL.startsWith('https://')) {
      console.error('MOMO_CALLBACK_URL must use https:// in production.')
      process.exit(1)
    }
  }

  const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']
  const missing = required.filter((key) => !env[key])
  if (missing.length > 0) {
    console.error(`Missing required production environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}

if (!isProduction) {
  if (!env.JWT_ACCESS_SECRET) env.JWT_ACCESS_SECRET = 'dev-access-secret-change-me'
  if (!env.JWT_REFRESH_SECRET) env.JWT_REFRESH_SECRET = 'dev-refresh-secret-change-me'
}

module.exports = { env, isProduction }
