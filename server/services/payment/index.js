const mockProvider = require('./mockProvider')
const mtnMomoProvider = require('./mtnMomoProvider')
const airtelProvider = require('./airtelProvider')
const cardProvider = require('./cardProvider')
const { env, isProduction } = require('../../config/env')

const providers = {
  mock: mockProvider,
  mtn_momo: mtnMomoProvider,
  airtel: airtelProvider,
  card: cardProvider,
}

const getProvider = (name) => providers[name] || providers[env.PAYMENT_PROVIDER] || mockProvider

const isProviderConfigured = (name) => {
  if (name === 'cash_on_delivery') return true
  if (name === 'mtn_momo') return mtnMomoProvider.isConfigured()
  if (name === 'mock') return !isProduction
  return false
}

const getPublicPaymentConfig = () => ({
  mode: isProduction ? 'live' : 'test',
  methods: [
    {
      value: 'cash_on_delivery',
      label: 'Cash on delivery',
      hint: 'Pay when you receive or collect',
      available: true,
      test: false,
    },
    {
      value: 'mock',
      label: 'Test payment',
      hint: 'Development test payment; no real charge',
      available: !isProduction,
      test: true,
    },
    {
      value: 'mtn_momo',
      label:
        env.MOMO_TARGET_ENVIRONMENT === 'sandbox'
          ? 'MTN Mobile Money (sandbox)'
          : 'MTN Mobile Money',
      hint:
        env.MOMO_TARGET_ENVIRONMENT === 'sandbox'
          ? 'Sandbox request; no real money moves'
          : 'Approve the payment prompt on your phone',
      available: mtnMomoProvider.isConfigured(),
      test: env.MOMO_TARGET_ENVIRONMENT === 'sandbox',
    },
    {
      value: 'airtel',
      label: 'Airtel Money',
      hint: 'Requires merchant credentials',
      available: false,
      test: false,
    },
    {
      value: 'card',
      label: 'Card',
      hint: 'Requires a hosted provider',
      available: false,
      test: false,
    },
  ],
})

module.exports = { getProvider, providers, isProviderConfigured, getPublicPaymentConfig }
