const ApiError = require('../../utils/ApiError')

/**
 * Card payments must use a hosted checkout page from an approved provider.
 * We never receive, store or log card numbers or CVV.
 */
module.exports = {
  name: 'card',
  async initiate() {
    throw new ApiError(
      501,
      'Card payments are not configured yet. A hosted checkout provider must be approved first.',
    )
  },
  async verify() {
    throw new ApiError(501, 'Card payments are not configured yet.')
  },
  async handleWebhook() {
    throw new ApiError(501, 'Card payment webhooks are not configured yet.')
  },
}
