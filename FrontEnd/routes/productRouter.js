const express = require('express')
const multer = require('multer')
const cloudinary = require('../utils/cloudinary')
const { storage } = require('../utils/cloudinary')
const upload = multer({storage})

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



router.get('/adminProducts', adminProduct)
router.get('/addProduct', addProduct)
router.get('/editProduct/:id', editProduct)

router.post('/addProduct/add', 
   upload.array('image'), 
   saveAddedProduct)
router.put('/editProduct/update/:id', 
   upload.array('image'), 
   saveUpdatedProduct)
router.put('/deleteProduct/:id', deleteProduct) 

router.get('/addBrand',addBrand)
router.post('/addBrand/add', saveBrandName )
router.get('/addCategory',addCategory)
router.post('/addCategory/add',saveCategory)
router.get('/deleteCategory/:id',deleteCategory)
router.get('/deleteBrand/:id',deleteBrand)

router.get('/productDetails/:id', viewProductDetails)
router.get('/allProducts', allProducts)
router.get('/allNewProducts', allNewProducts)


module.exports = router