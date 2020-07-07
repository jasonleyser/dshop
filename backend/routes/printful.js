const { authSellerAndShop, authShop } = require('./_auth')
const encConf = require('../utils/encryptedConfig')
const { findOrder } = require('../utils/orders')
const {
  fetchOrder,
  placeOrder,
  confirmOrder,
  fetchShippingEstimate,
  processShippedEvent
} = require('../utils/printful')
const { getLogger } = require('../utils/logger')
const log = getLogger('routes.printful')

module.exports = function (app) {
  app.get(
    '/orders/:orderId/printful',
    authSellerAndShop,
    findOrder,
    async (req, res) => {
      const apiKey = await encConf.get(req.order.shopId, 'printful')
      const { status, ...resp } = await fetchOrder(apiKey, req.order.orderId)

      return res.status(status || 200).send(resp)
    }
  )

  app.post(
    '/orders/:orderId/printful/create',
    authSellerAndShop,
    async (req, res) => {
      const apiKey = await encConf.get(req.shop.id, 'printful')
      const opts = { draft: req.body.draft }
      const { status, ...resp } = await placeOrder(apiKey, req.body, opts)

      return res.status(status || 200).send(resp)
    }
  )

  app.post(
    '/orders/:orderId/printful/confirm',
    authSellerAndShop,
    findOrder,
    async (req, res) => {
      const apiKey = await encConf.get(req.order.shopId, 'printful')
      const { status, ...resp } = await confirmOrder(apiKey, req.params.orderId)

      return res.status(status || 200).send(resp)
    }
  )

  app.post('/shipping', authShop, async (req, res) => {
    // console.log(req.body)
    const apiKey = await encConf.get(req.shop.id, 'printful')
    const { status, ...resp } = await fetchShippingEstimate(apiKey, req.body)

    return res.status(status || 200).send(resp)
  })

  app.post('/printful/webhooks/:shopId/:secret', async (req, res) => {
    const { data } = req.body
    const { shopId, secret } = req.params

    try {
      const storedSecret = await encConf.get(shopId, 'printfulWebhookSecret')

      if (secret !== storedSecret) {
        log.error('Invalid secret, ignoring event', data)
        return res.status(200).end()
      }
    } catch (err) {
      log.error('Failed to validate secret on request', shopId, err)
    }

    await processShippedEvent(data)

    return res.status(200).end()
  })
}
