const express = require('express')
const router = express()

const {
    coupens,
    addCoupen,
    saveCoupen,
    deleteCoupen,
    applyCoupen
} = require('../controllers/coupenController')


router.get('/coupens', coupens)
router.get('/addCoupen', addCoupen)
router.post('/saveCoupen', saveCoupen)
router.get('/deleteCoupen/:id', deleteCoupen)
router.post('/applyCoupen/:id', applyCoupen)

module.exports = router