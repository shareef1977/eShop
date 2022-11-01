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


router.get('/checkout/:id', checkoutPage)
router.post('/placeOrder', placeOrder)
router.get('/orderSuccess',orderSuccess)
router.post('/verifyPay',verifyPay)
router.get('/viewOrders',viewOrders)
router.get('/orderedProducts/:id',orderedProducts)
router.get('/checkoutAddress',checkoutAddress)
router.put('/cancelOrder/:id', cancelOrder)





module.exports = router