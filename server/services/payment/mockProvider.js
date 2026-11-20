/**
 * MOCK PAYMENT PROVIDER — TEST MODE ONLY.
 * No real money moves. The UI must show a "TEST PAYMENT" notice.
 */
module.exports = {
  name: 'mock',
  async initiate(payment) {
    return {
      providerRef: `MOCK-${payment._id}-${Date.now()}`,
      status: 'paid',
      redirectUrl: null,
      message: 'TEST PAYMENT — no real money was charged.',
    }
  },
  async verify(payment) {
    return { status: payment.status }
  },
  async handleWebhook(payload) {
    return {
      providerRef: payload.providerRef,
      status: payload.status === 'failed' ? 'failed' : 'paid',
    }
  },
}
