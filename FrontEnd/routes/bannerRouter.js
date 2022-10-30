const express = require('express')
const router = express()
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')

const { storage } = require('../utils/cloudinary')
const upload = multer({storage})

const {
    setBanner,
    addBanner,
    saveBanner
} = require('../controllers/bannerController')

router.get('/setBanner', setBanner)
router.get('/addBanner', addBanner)
router.post('/addBanner/add', upload.array('image'), saveBanner)


module.exports = router