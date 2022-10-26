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
    // saveChangedAddress,    
    logout
} = require('../controllers/userController')

const {
   sessionCheck,
   sessionCheckHomePage    
} = require('../middleware')

 
router.get('/', sessionCheckHomePage, userHomePage)
router.get('/signup', signupPage)
router.post('/otpPage', otpPage)
router.get('/otpPage', getOtpPage)

router.post('/verifyOtp', verifyOTP)
router.get('/resendOTPCode', resendOTPCode)
router.post('/homePage',  homePage)
router.get('/loginPage', sessionCheck, loginPage)

router.get('/user/logout',  logout)
router.get('/userProfile/:id',userProfile)


router.get('/addAddress', addAddress)
router.post('/saveAddress/:id',saveAddress)
router.get('/deleteAddress/:id',deleteAddress)
// router.put('/saveChangedAddress/:id',saveChangedAddress)






module.exports = router