const { randomUUID } = require('crypto')
const { env } = require('../../config/env')
const ApiError = require('../../utils/ApiError')

let cachedToken = ''
let tokenExpiresAt = 0

const getBaseUrl = () => {
  if (env.MOMO_BASE_URL) return env.MOMO_BASE_URL.replace(/\/+$/, '')
  return env.MOMO_TARGET_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.momodeveloper.mtn.com'
    : 'https://momoapi.momo.africa'
}

const getCredentials = () => ({
  user: env.MOMO_USER_ID || env.MOMO_API_USER,
  key: env.MOMO_CREDENTIAL_TOKEN || env.MOMO_API_KEY,
})

const isConfigured = () => {
  const credentials = getCredentials()
  return Boolean(
    env.MOMO_SUBSCRIPTION_KEY && credentials.user && credentials.key && env.MOMO_CALLBACK_URL,
  )
}

const ensureConfigured = () => {
  if (!isConfigured()) {
    throw new ApiError(
      503,
      'MTN Mobile Money is not configured. Set the MTN MoMo collections credentials and callback URL.',
    )
  }
}

const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')

  if (/^2507\d{8}$/.test(digits)) return digits
  if (/^07\d{8}$/.test(digits)) return `250${digits.slice(1)}`
  if (/^7\d{8}$/.test(digits)) return `250${digits}`

  throw new ApiError.badRequest('Enter a valid MTN Mobile Money number, for example 0781234567.')
}

const buildCallbackUrl = (referenceId, webhookToken) => {
  const raw = env.MOMO_CALLBACK_URL.trim()

  if (!raw) {
    throw new ApiError(503, 'MOMO_CALLBACK_URL is required for MTN Mobile Money payments.')
  }

  let callbackUrl
  try {
    callbackUrl = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    throw new ApiError(500, 'MOMO_CALLBACK_URL is not a valid URL.')
  }

  callbackUrl.searchParams.set('ref', referenceId)
  if (webhookToken) callbackUrl.searchParams.set('token', webhookToken)
  return callbackUrl.toString()
}

const callMomo = async (path, options = {}, allowedStatuses = [200, 202]) => {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Ocp-Apim-Subscription-Key': env.MOMO_SUBSCRIPTION_KEY,
      'X-Target-Environment': env.MOMO_TARGET_ENVIRONMENT || 'sandbox',
      ...(options.headers || {}),
    },
  })

  if (!allowedStatuses.includes(response.status)) {
    const text = await response.text()
    let message = text

    try {
      const parsed = JSON.parse(text)
      message = parsed.message || parsed.error || parsed.errorCode || parsed.code || text
    } catch {
      message = text
    }

    throw new ApiError(
      502,
      `MTN MoMo request failed (${response.status}): ${String(message).slice(0, 300)}`,
    )
  }

  return response
}

const getAccessToken = async () => {
  ensureConfigured()

  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const credentials = getCredentials()
  const basic = Buffer.from(`${credentials.user}:${credentials.key}`).toString('base64')
  const response = await callMomo(
    '/collection/token/',
    {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}` },
    },
    [200, 201],
  )
  const data = await response.json()

  if (!data.access_token) {
    throw new ApiError(502, 'MTN MoMo did not return an access token.')
  }

  cachedToken = data.access_token
  const expiresIn = Number(data.expires_in) || 3600
  tokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 30) * 1000
  return cachedToken
}

const mapStatus = (status) => {
  const normalized = String(status || '').toUpperCase()
  if (normalized === 'SUCCESSFUL') return 'paid'
  if (normalized === 'FAILED') return 'failed'
  return 'pending'
}

const verifyPayment = async (payment) => {
  ensureConfigured()

  if (!payment.providerRef) {
    throw new ApiError(400, 'This payment has no MTN MoMo reference.')
  }

  const token = await getAccessToken()
  const response = await callMomo(
    `/collection/v1_0/requesttopay/${encodeURIComponent(payment.providerRef)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    },
    [200],
  )
  const data = await response.json()

  return {
    status: mapStatus(data.status),
    financialTransactionId: data.financialTransactionId || '',
    message: data.reason || '',
  }
}

module.exports = {
  name: 'mtn_momo',
  isConfigured,
  async initiate(payment, order) {
    ensureConfigured()

    const token = await getAccessToken()
    const referenceId = payment.providerRef || randomUUID()
    const callbackUrl = buildCallbackUrl(referenceId, payment.webhookToken)
    const amount = String(Math.round(Number(payment.amount)))
    const externalId =
      String(order.orderNumber || '')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .slice(0, 64) || referenceId

    await callMomo(
      '/collection/v1_0/requesttopay',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Callback-Url': callbackUrl,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: env.MOMO_CURRENCY || 'RWF',
          externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: normalizePhone(order.shippingAddress?.phone),
          },
          payerMessage: `Payment for ${order.orderNumber}`,
          payeeNote: `Sawa Citi order ${order.orderNumber}`,
        }),
      },
      [202],
    )

    return {
      providerRef: referenceId,
      status: 'pending',
      message:
        'MTN MoMo payment request sent. Approve the prompt on the phone number you provided.',
    }
  },
  async verify(payment) {
    return verifyPayment(payment)
  },
  async handleWebhook(payload, payment) {
    ensureConfigured()

    if (!payment) {
      return { status: 'pending' }
    }

    const reference = payload?.referenceId || payload?.externalId || payload?.reference
    if (reference && payment.providerRef && reference !== payment.providerRef) {
      return { status: 'pending' }
    }

    return verifyPayment(payment)
  },
}
