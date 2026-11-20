/**
 * Payment provider contract.
 *
 * Every provider must implement:
 *   - name: string
 *   - initiate(payment, order): Promise<{ providerRef, status, redirectUrl?, message? }>
 *   - verify(payment): Promise<{ status }>
 *   - handleWebhook(payload): Promise<{ providerRef, status }>
 *
 * Real providers must verify signed webhooks server-side and never trust the client.
 */
module.exports = {
  name: 'interface',
  async initiate() {
    throw new Error('initiate() not implemented')
  },
  async verify() {
    throw new Error('verify() not implemented')
  },
  async handleWebhook() {
    throw new Error('handleWebhook() not implemented')
  },
}
