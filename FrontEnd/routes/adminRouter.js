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

// const {
//     adminSessionCheck
// } = require('../middleware')
 

router.get('/adminLogin',   adminLogin) 
router.get('/adminHome',adminHomePage)
router.post('/adminHome', adminHome)
router.get('/logout',  logout)

router.get('/adminCategory', adminCategory) 
router.get('/adminBrand', adminBrand)
router.get('/adminUser', adminUser)

router.put('/editUser/:id', editUser)

router.get('/orders',productOrders)
router.get('/orderitems/:id',orderItems)

router.get('/editOrders/:id',editOrder)
router.post('/updateOrder/:id', updateOrder)

module.exports = router