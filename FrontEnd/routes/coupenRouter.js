const express = require('express')
const router = express()

const {
    coupens,
    addCoupen,
    saveCoupen,
    deleteCoupen,
    applyCoupen
} = require('../controllers/coupenController')

const {
    adminSessionCheckHomePage
} = require('../middleware')

router.get('/coupons', adminSessionCheckHomePage, coupens)
router.get('/addCoupen', adminSessionCheckHomePage, addCoupen)
router.post('/saveCoupen', adminSessionCheckHomePage, saveCoupen)
router.delete('/deleteCoupen/:id', adminSessionCheckHomePage, deleteCoupen)
router.post('/applyCoupen/:id', applyCoupen)

module.exports = router