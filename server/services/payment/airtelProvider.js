const ApiError = require('../../utils/ApiError')

module.exports = {
  name: 'airtel',
  async initiate() {
    throw new ApiError(
      501,
      'Airtel Money is not configured yet. Add approved merchant credentials to enable it.',
    )
  },
  async verify() {
    throw new ApiError(501, 'Airtel Money is not configured yet.')
  },
  async handleWebhook() {
    throw new ApiError(501, 'Airtel Money webhooks are not configured yet.')
  },
}
