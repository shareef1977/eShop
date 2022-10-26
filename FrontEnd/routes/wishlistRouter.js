const express = require('express')
const router = express()

const {
    addToWishlist,
    userWishlist,
    deleteWishlist,
} = require('../controllers/wishlistController')


router.get('/addToWishlist/:id',addToWishlist)
router.get('/wishlist/:id',userWishlist)
router.get('/deleteWishlistItem/:id',deleteWishlist)


module.exports = router