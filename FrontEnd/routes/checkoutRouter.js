const express = require('express')
const router = express()

const {
    checkoutPage,
    placeOrder,
    orderSuccess,
    verifyPay,
    viewOrders,
    orderedProducts,
    checkoutAddress,
    cancelOrder
} = require('../controllers/checkoutController')

const {
    sessionCheckHomePage
} = require('../middleware')

router.get('/checkout/:id', sessionCheckHomePage, checkoutPage)
router.post('/placeOrder', sessionCheckHomePage, placeOrder)
router.get('/orderSuccess', orderSuccess)
router.post('/verifyPay', sessionCheckHomePage, verifyPay)
router.get('/viewOrders', sessionCheckHomePage, viewOrders)
router.post('/orderedProducts', sessionCheckHomePage, orderedProducts)
router.get('/checkoutAddress', sessionCheckHomePage, checkoutAddress)
router.put('/cancelOrder/:id', sessionCheckHomePage, cancelOrder)

module.exports = router