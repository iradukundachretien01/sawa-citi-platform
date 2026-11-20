const express = require('express')
const { listBranches } = require('../controllers/productController')

const router = express.Router()

router.get('/', listBranches)

module.exports = router
