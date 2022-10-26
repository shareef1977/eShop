const express = require('express')

const router = express()

const {
    singleProduct,
    
    adminSingleProduct,
    
} = require('../controllers/categoryController')

router.get('/user/singleProduct/:id',singleProduct)



router.get('/admin/singleProduct/:id', adminSingleProduct)


module.exports = router