const express = require('express')

const router = express()

const {
    singleProduct,
    adminSingleProduct,
} = require('../controllers/categoryController')

const {
    adminSessionCheckHomePage
} = require('../middleware')

router.get('/user/singleProduct/:id', singleProduct)
router.get('/admin/singleProduct/:id', adminSessionCheckHomePage, adminSingleProduct)

module.exports = router