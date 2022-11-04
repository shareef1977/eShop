const express = require('express')

const router = express()

const {
    singleProduct,
    
    adminSingleProduct,
    
} = require('../controllers/categoryController')

const {
    adminSessionCheck,
    adminSessionCheckHomePage
 } = require('../middleware')
 
 const {
    sessionCheck,
    sessionCheckHomePage    
 } = require('../middleware')

router.get('/user/singleProduct/:id', sessionCheckHomePage, singleProduct)



router.get('/admin/singleProduct/:id', adminSessionCheckHomePage, adminSingleProduct)


module.exports = router