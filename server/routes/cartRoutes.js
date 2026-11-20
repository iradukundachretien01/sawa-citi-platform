const express = require('express')
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { cartAddSchema, cartUpdateSchema } = require('../validators/schemas')

const router = express.Router()

router.use(protect)

router.get('/', getCart)
router.post('/items', validate({ body: cartAddSchema }), addItem)
router.patch('/items/:productId', validate({ body: cartUpdateSchema }), updateItem)
router.delete('/items/:productId', removeItem)
router.delete('/', clearCart)

module.exports = router
