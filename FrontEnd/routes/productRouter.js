const express = require('express')
const multer = require('multer')
const cloudinary = require('../utils/cloudinary')
const { storage } = require('../utils/cloudinary')
const upload = multer({ storage })

const router = express()
const {
   adminProduct,
   addProduct,
   editProduct,
   saveAddedProduct,
   saveUpdatedProduct,
   deleteProduct,
   addBrand,
   saveBrandName,
   addCategory,
   saveCategory,
   deleteCategory,
   deleteBrand,
   viewProductDetails,
   allNewProducts,
   allProducts,
} = require('../controllers/productController')

const {
   adminSessionCheckHomePage
} = require('../middleware')

router.get('/adminProducts', adminSessionCheckHomePage, adminProduct)
router.get('/addProduct', adminSessionCheckHomePage, addProduct)
router.get('/editProduct/:id', adminSessionCheckHomePage, editProduct)
router.post('/addProduct/add', adminSessionCheckHomePage,
   upload.array('image'),
   saveAddedProduct)
router.put('/editProduct/update/:id', adminSessionCheckHomePage,
   upload.array('image'),
   saveUpdatedProduct)
router.put('/deleteProduct/:id', adminSessionCheckHomePage, deleteProduct)
router.get('/addBrand', adminSessionCheckHomePage, addBrand)
router.post('/addBrand/add', adminSessionCheckHomePage, saveBrandName)
router.get('/addCategory', adminSessionCheckHomePage, addCategory)
router.post('/addCategory/add', adminSessionCheckHomePage, saveCategory)
router.put('/deleteCategory/:id', adminSessionCheckHomePage, deleteCategory)
router.put('/deleteBrand/:id', adminSessionCheckHomePage, deleteBrand)
router.get('/productDetails/:id', viewProductDetails)
router.get('/allProducts', allProducts)
router.get('/allNewProducts', allNewProducts)

module.exports = router