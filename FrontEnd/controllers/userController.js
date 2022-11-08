require('dotenv').config()
const nodemailer = require('nodemailer')
const userData = require('../models/userModel')
const productData = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const addressData = require('../models/addressModel')
const cartData = require('../models/cartModel')
const wishlistData = require('../models/wishlistModel')
const bannerData = require('../models/bannerModel')
const checkoutData = require('../models/checkoutModel')
const mongoose = require('mongoose')

const { hashPassword,
    comparePassword,
    hashOTP,
    compareOTP
} = require('../utils/helpers')

const UserOTPVerification = require('../models/userOTPVerificationModel')
const { resolveHostname } = require('nodemailer/lib/shared')

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

const signupPage = (req, res) => {
    try {
        res.render('user/signup')
    } catch (err) {
        res.render('error', { err })
    }
}

const otpPage = async (req, res) => {
    try {
        const regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const { name, email, mobile, password, password2 } = req.body
        if (!name || !email || !mobile || !password || !password2) {
            req.flash('error', 'Fields cannot be empty!!!')
            res.redirect('/signup')
        } else if (name.length < 5 || name.length > 15) {
            req.flash('error', 'Name must be in 5 to 15 letters')
            res.redirect('/signup')
        } else if (!email.match(regx)) {
            req.flash('error', 'Enter a valid email')
            res.redirect('/signup')
        } else if (mobile.length != 10 || isNaN(mobile)) {
            req.flash('error', 'Enter a valid mobile number')
            res.redirect('/signup')
        } else if (password.length < 6 || password.length > 15) {
            req.flash('error', 'Password must be with in 6 to 15 characters')
            res.redirect('/signup')
        } else if (password2 !== password) {
            req.flash('error', 'Entered passwords are not matching')
            res.redirect('/signup')
        } else {
            userDB = await userData.findOne({ $or: [{ email }, { mobile }] })
            if (userDB) {
                req.flash('error', 'Email or Mobile number is already exists. Try with another')
                return res.redirect('/signup')
            } else {
                const hashedPassword = hashPassword(req.body.password)
                const details = await new userData({
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: hashedPassword,
                    verified: false,
                    blockStatus: false
                })
                details
                    .save()
                    .then((result) => {
                        sendOTPVerificationEmail(result, req, res)
                    })
                    .catch((err) => {
                        res.render('error', { err })
                    })
            }
        }
    } catch (err) {
        res.render('error', { err })
    }
}

const sendOTPVerificationEmail = async ({ _id, email }, req, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "verify your email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the sign up </p><p> This code <b> Expires in 10 Minutes</b>.</p>`
        }
        const hashedOTP = hashOTP(otp)
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        })
        await newOTPVerification.save()
        await transporter.sendMail(mailOptions)
        req.flash('success', 'An OTP has sended to your Email')
        res.render('user/otpPage', { emailID: { _id, email, hashedOTP } })
    }
    catch (err) {
        res.render('error',{err})
    }
}

const getOtpPage = async (req, res) => {
    try {
        res.redirect('/otpPage')
    } catch (err) {
        res.render('error',{err})
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp, hashedOTP } = req.body
        if (!userId || !otp) {
            req.flash('error', 'Empty OTP details are not allowed')
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({ userId })
            if (UserOTPVerificationRecords.length <= 0) {
                req.flash('error', "Account record doesn't exist or has been verified already. Please sign up or login.")
                res.redirect('/signup')
            } else {
                const { expiresAt } = UserOTPVerificationRecords[0]
                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ userId })
                    await userData.findByIdAndDelete(userId)
                    req.flash('error', "OTP has expired. Please request again. Try after 10 minutes")
                    res.redirect('/signup')
                } else {
                    const validOTP = compareOTP(otp, hashedOTP)
                    if (!validOTP) {
                        req.flash('error', "Invalid code passed. Check your inbox. Try after 10 minutes")
                        res.redirect('/signup')
                    } else {
                        await userData.updateOne({ _id: userId }, { verified: true })
                        await UserOTPVerification.deleteMany({ userId })
                        req.flash('success', 'Successfully Registered')
                        res.render('user/loginPage')
                    }
                }
            }
        }
    } catch (err) {
        res.render('error',{err})
    }
}

const resendOTPCode = async (req, res) => {
    try {
        let { userId, email } = req.body

        if (!userId || !email) {
            throw Error("Empty user details are not allowed")
        } else {
            await UserOTPVerification.deleteMany({ userId })
            req.flash('success', 'OTP has resended your email.')
            res.redirect('/otpPage')

            sendOTPVerificationEmail({ _id: userId, email }, res)
        }

    } catch (err) {
        res.render('error',{err})
    
    }
}

const loginPage = (req, res) => {
    try {
        res.render('user/loginPage')
    } catch (err) {
        res.render('error',{err})
    }
}

const homePage = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userData.findOne({ email })
        if (!user) {
            req.flash('error', 'Invalid Email or Password')
            return res.redirect('/loginPage')
        }
        const isValid = comparePassword(password, user.password)
        if (isValid) {
            if (!user.verified) {
                req.flash('error', "You are not a verified user!!!")
                res.redirect('/loginPage')
            } else {
                req.flash('success', 'Login Successfully completed')
                req.session.user = user;
                return res.redirect('/')
            }
        } else {
            req.flash('error', 'Invalid Email or Password')
            res.redirect('/loginPage')
        }
    } catch (err) {
        res.render('error',{err})
    }
}

const logout = (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        res.render('error',{err})
    }
}

const userHomePage = async (req, res) => {
    try {
        let cartCount;
        let wishlistCount
        let cartItems;
        let wishlistItems
        let orderData
        if (req.session.user) {
            const userId = req.session.user._id
            orderData = await checkoutData.find({ userId: userId })
            cartItems = await cartData.findOne({ userId })
            wishlistItems = await wishlistData.findOne({ userId })
            cartCount = await cartData.aggregate([{$match:{userId}},{$project:{count:{$size:"$cartItems"}}},{$project:{_id:0}}]);
            wishlistCount = await wishlistData.aggregate([{$match:{userId}},{$project:{count:{$size:"$wishlistItems"}}},{$project:{_id:0}}]);
        }
        const products = await productData.find({ deleted: false }).limit(4)
        const categories = await categoryData.find({})
        const banner = await bannerData.find({}).sort({ date: -1 })
        const justArrived = await productData.find({
            $and: [{
                expiresAt: { $gte: Date.now() }
            }, { deleted: false }]
        }).limit(4)
        res.render('user/index', { products, categories, justArrived, cartCount, wishlistCount, cartItems, wishlistItems, orderData, banner })
    } catch (err) {
        res.render('error',{err})
    }
}

const userProfile = async (req, res) => {
    try {
        const userId = req.params.id
        const address = await addressData.find({ userId })
        res.render('user/Profile', { address })
    } catch (err) {
        res.render('error',{err})
    }
}

const addAddress = async (req, res) => {
    try {
        res.render('user/addAddress')
    } catch (err) {
        res.render('error',{err})
    }
}

const saveAddress = async (req, res) => {
    try {
        const { id } = req.params
        const count = await addressData.find({ id }).count()
        if (!req.body) {
            req.flash('error', 'Empty fields are not allowed')
            res.redirect('back')
        }
        else {
            const addr = await new addressData({
                userId: id,
                houseNo: req.body.houseNo,
                street: req.body.street,
                district: req.body.district,
                state: req.body.state,
                pincode: req.body.pincode
            })
            addr.save()
                .then(() => {
                    req.flash('success', 'Address successfully added')
                    res.redirect('back')
                })
                .catch((err) => {
                    res.render('error',{err})
                })
        }
    } catch (err) {
        res.render('error',{err})
    }

}

const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params
        const deletion = await addressData.findOneAndDelete({ id })
        deletion.remove()
        res.send({ success: true })
    } catch (err) {
        res.render('error',{err})
    }
}

const updateProfile = async (req, res) => {
    try {
        const id = req.session.user._id
        await userData.findByIdAndUpdate(id, {
            name: req.body.name,
        })
        const user = await userData.findById(id)
        req.session.user = user
        res.send({ success: true })
    } catch (err) {
        res.render('error',{err})
    }
}

module.exports = {
    signupPage,
    otpPage,
    verifyOTP,
    loginPage,
    resendOTPCode,
    homePage,
    updateProfile,
    logout,
    userHomePage,
    getOtpPage,
    userProfile,
    saveAddress,
    addAddress,
    deleteAddress,
}