const express = require('express')
const router = express()

const {
    userCart,
    addToCart,
    itemInc,
    itemDec,
    itemDelete,
} = require('../controllers/cartController')

const {
    sessionCheckHomePage
} = require('../middleware')

router.get('/cart/:id', sessionCheckHomePage, userCart)
router.get('/addToCart/:id', sessionCheckHomePage, addToCart)
router.post('/itemInc/:id', itemInc)
router.post('/itemDec/:id', itemDec)
router.put('/itemDelete/:id', itemDelete)

module.exports = router