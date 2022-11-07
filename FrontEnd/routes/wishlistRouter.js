const express = require('express')
const router = express()

const {
    addToWishlist,
    userWishlist,
    deleteWishlist,
} = require('../controllers/wishlistController')

const {
    sessionCheckHomePage
} = require('../middleware')

router.get('/addToWishlist/:id', sessionCheckHomePage, addToWishlist)
router.get('/wishlist/:id', sessionCheckHomePage, userWishlist)
router.delete('/deleteWishlistItem/:id', sessionCheckHomePage, deleteWishlist)

module.exports = router 