const express = require('express')
const router = express()
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')

const { storage } = require('../utils/cloudinary')
const upload = multer({ storage })

const {
    setBanner,
    addBanner,
    saveBanner
} = require('../controllers/bannerController')

const {
    adminSessionCheckHomePage
} = require('../middleware')

router.get('/setBanner', adminSessionCheckHomePage, setBanner)
router.get('/addBanner', adminSessionCheckHomePage, addBanner)
router.post('/addBanner/add', adminSessionCheckHomePage, upload.array('image'), saveBanner)

module.exports = router