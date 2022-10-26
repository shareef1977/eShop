const express = require('express')
const router = express()

const {
    userCart, 
    addToCart,
    itemInc,
    itemDec,
    itemDelete,
} = require('../controllers/cartController')

router.get('/cart/:id', userCart)
router.get('/addToCart/:id',addToCart)

router.post('/itemInc/:id',itemInc)
router.post('/itemDec/:id',itemDec)
router.get('/itemDelete/:id',itemDelete)


module.exports = router