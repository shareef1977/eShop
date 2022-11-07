const express = require('express')
const router = express()
const {
    signupPage,
    otpPage,
    verifyOTP, 
    loginPage,
    resendOTPCode, 
    homePage,
    userHomePage,   
    getOtpPage,
    userProfile,
    addAddress,
    saveAddress,
    deleteAddress,
    updateProfile,   
    logout
} = require('../controllers/userController')

const {
   sessionCheck,
   sessionCheckHomePage    
} = require('../middleware')
 
router.get('/'  , userHomePage) 
router.get('/signup', signupPage)
router.post('/otpPage', otpPage)
router.get('/otpPage', getOtpPage)
router.post('/verifyOtp', verifyOTP)
router.get('/resendOTPCode', resendOTPCode)
router.post('/homePage',  homePage)
router.get('/loginPage', sessionCheck, loginPage)
router.get('/user/logout',  logout)
router.get('/userProfile/:id', sessionCheckHomePage, userProfile)
router.put('/updateProfile', updateProfile )
router.get('/addAddress', sessionCheckHomePage, addAddress)
router.post('/saveAddress/:id', sessionCheckHomePage, saveAddress)
router.delete('/deleteAddress/:id', sessionCheckHomePage, deleteAddress)

module.exports = router