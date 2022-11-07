const express = require('express')

const router = express()
const {
    adminLogin,
    adminHome,
    adminBrand,
    adminCategory,
    adminUser,
    adminHomePage,
    editUser,
    productOrders,
    orderItems,
    editOrder,
    updateOrder,
    logout
} = require('../controllers/adminController')

const {
    adminSessionCheck,
    adminSessionCheckHomePage
} = require('../middleware')

router.get('/adminLogin', adminSessionCheck, adminLogin)
router.get('/adminHome', adminSessionCheckHomePage, adminHomePage)
router.post('/adminHome', adminHome)
router.get('/logout', logout)
router.get('/adminCategory', adminSessionCheckHomePage, adminCategory)
router.get('/adminBrand', adminSessionCheckHomePage, adminBrand)
router.get('/adminUser', adminSessionCheckHomePage, adminUser)
router.put('/editUser/:id', adminSessionCheckHomePage, editUser)
router.get('/orders', adminSessionCheckHomePage, productOrders)
router.post('/orderitems', adminSessionCheckHomePage, orderItems)
router.get('/editOrders/:id', adminSessionCheckHomePage, editOrder)
router.post('/updateOrder/:id', adminSessionCheckHomePage, updateOrder)

module.exports = router