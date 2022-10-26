const express = require('express')
const router = express()
 
const {
    checkoutPage,
    placeOrder,
    orderSuccess,
    verifyPay,
    // oneItemCheckout,
    // singleItemPlaceOrder
} = require('../controllers/checkoutController')


router.get('/checkout/:id', checkoutPage)
router.post('/placeOrder', placeOrder)
router.get('/orderSuccess',orderSuccess)
router.post('/verifyPay',verifyPay)
// router.get('/oneItemOrder/:id', oneItemCheckout)
// router.post('/placeSingleOrder/:id', singleItemPlaceOrder) 





module.exports = router