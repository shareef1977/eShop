require('dotenv').config()
const nodemailer = require('nodemailer')
const userData = require('../models/userModel')
const productData = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const brandData = require('../models/brandModel')
const addressData = require('../models/addressModel')
const cartData = require('../models/cartModel')
const wishlistData = require('../models/wishlistModel')
const mongoose = require('mongoose')

  
const bcrypt = require('bcrypt')

const { hashPassword,
        comparePassword,
        hashOTP,
        compareOTP 
} = require('../utils/helpers')

const UserOTPVerification = require('../models/userOTPVerificationModel')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const addressModel = require('../models/addressModel')
const { resolveHostname } = require('nodemailer/lib/shared')

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.AUTH_EMAIL, 
        pass: process.env.AUTH_PASS
    }
})


const signupPage = (req,res) => {
    
    try {
        res.render('user/signup')
    } catch(err) {
        console.log(err)
    }
}

const otpPage = async(req,res) => {
    try {

        const regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const {name,email,mobile,password,password2} = req.body
        if(!name || !email || !mobile || !password || !password2) {
            req.flash('error', 'Fields cannot be empty!!!')
            res.redirect('/signup')
        } else if(name.length < 5 || name.length > 15 ){
            req.flash('error','Name must be in 5 to 15 letters')
            res.redirect('/signup')
        } else if (!email.match(regx)){
            req.flash('error','Enter a valid email')
            res.redirect('/signup')
        }else if (mobile.length != 10 || isNaN(mobile)) {
            req.flash('error','Enter a valid mobile number')
            res.redirect('/signup')
        } else if(password.length < 6 || password.length > 15) {
            req.flash('error', 'Password must be with in 6 to 15 characters')
            res.redirect('/signup')
        } else if(password2 !== password) {
            req.flash('error','Entered passwords are not matching')
            res.redirect('/signup')
        } else {
        userDB = await userData.findOne({$or:[{email},{mobile}]})

        if(userDB) {
            req.flash('error','Email or Mobile number is already exists. Try with another')
            return res.redirect('/signup')
        } else {
        
            console.log(req.body); 
            const hashedPassword = hashPassword(req.body.password)
            const details = await new userData({
                name: req.body.name,
                email: req.body.email,
                mobile:req.body.mobile,
                password:hashedPassword,
                verified:false,
                blockStatus: false
            })
        
       
        details
            .save()
            .then((result) => {
              
                sendOTPVerificationEmail(result,req,res)
                
            })
            .catch((err) => {
                console.log(err)
            })

        }
    }
   

    } catch(err) {
        console.log(err)
    }
}  

const sendOTPVerificationEmail = async({_id,email},req,res) => {
    try{
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "verify your email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the sign up </p><p> This code <b> Expires in 10 Minutes</b>.</p>`
        }

        
        const hashedOTP =  hashOTP(otp)
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        })
 
        
       
        await newOTPVerification.save()

        

        await transporter.sendMail(mailOptions)
        req.flash('success','An OTP has sended to your Email')
        res.render('user/otpPage',{emailID: {_id,email,hashedOTP}})
        // res.json({
        //     status: "PENDING",
        //     message: "verification otp mail send",
        //     date: {
        //         userId: _id,
        //         email
        //     }
        // })
        console.log(email)
       
    }
    catch(err){
        res.json({
            status: "FAILED",
            message: err.message,
        })
    }
}
const getOtpPage = async(req,res) => {
    try{
        res.redirect('/otpPage')
    } catch(err) {
        console.log(err)
    }
}

const verifyOTP = async(req,res) => {
    try{
        const {userId, otp, hashedOTP} = req.body
        console.log(userId)
        console.log(hashedOTP)

        console.log(otp)
        
        if(!userId || !otp) {
            // throw Error("Empty OTP details are not allowed")
            req.flash('error','Empty OTP details are not allowed')
            
        } else {
           

            console.log(userId)

           console.log(UserOTPVerification.find({
                userId
           }))
            const UserOTPVerificationRecords = await UserOTPVerification.find({ userId })

            console.log(UserOTPVerificationRecords)
            
            

            if(UserOTPVerificationRecords.length <= 0) {
                // throw new Error("Account record doesn't exist or has been verified already. Please sign up or login.")
                req.flash('error',"Account record doesn't exist or has been verified already. Please sign up or login.")
                res.redirect('/signup')
            } else {
                const { expiresAt } = UserOTPVerificationRecords[0]
            //     const hashedOTP = UserOTPVerificationRecords[0].otp

                console.log(expiresAt)
 
                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ userId })
                    await userData.findByIdAndDelete(userId)
                    // throw new Error("OTP has expired. Please request again.")
                    req.flash('error',"OTP has expired. Please request again. Try after 10 minutes")
                    res.redirect('/signup')
                    
                } else {
                    
                    const validOTP = compareOTP(otp,hashedOTP)
                    
                    
                    console.log(otp+"one");
                    console.log(hashedOTP+"two");


                    if(!validOTP) {
                        // throw new Error("Invalid code passed. Check your inbox.")
                        req.flash('error',"Invalid code passed. Check your inbox. Try after 10 minutes")
                        res.redirect('/signup')
                    } else {
                        
                       await userData.updateOne({ _id: userId }, { verified: true })
                       await UserOTPVerification.deleteMany({ userId })
                       
                    //    console.log(UserOTPVerification.userId)
                    //    console.log(userData.verified)
                    //    console.log(userData._id)
                        
                       
                        req.flash('success','Successfully Registered')
                       res.render('user/loginPage')
                        // res.json({
                        //     status: "VERIFIED",
                        //     message: "User email verified successfull"
                        // })
                    }
                }

            }

        }
    } catch (err) {
        res.json({
            status: "FAILED",
            message: err.message

        })

    }

}

const resendOTPCode = async(req,res) => {
    try{
        let {userId, email} = req.body

        if(!userId || !email) {
            throw Error("Empty user details are not allowed")
        } else {
            await UserOTPVerification.deleteMany({userId})
            req.flash('success','OTP has resended your email.')
            res.redirect('/otpPage')

            sendOTPVerificationEmail({_id: userId, email},res)
        }

    } catch(err){
        res.json({
            status: "FAILED",
            message: err.message
        })
    }
}



const loginPage = (req,res) => {
    try {
        res.render('user/loginPage')
    } catch (err) {
        console.log(err)
    }
}

const homePage = async (req,res) => {
   try {
    const { email,password } = req.body
   
    const user = await userData.findOne({email})

    if(!user) {
        req.flash('error', 'Invalid Email or Password')
       return  res.redirect('/loginPage')

    }
   
    const isValid = comparePassword(password,user.password)

   
    if (isValid){
        // const details = await homeModel.find({})
        
        
       if(!user.verified){
        req.flash('error', "You are not a verified user!!!")
        res.redirect('/loginPage')
       }else{
        req.flash('success','Login Successfully completed')
        req.session.user = user;
        
        
        return res.redirect('/')
        
       }
    } else {
        req.flash('error', 'Invalid Email or Password')
        res.redirect('/loginPage')
    }
   } catch(err) {
    console.log(err)
   }
}





const logout = (req,res) => {
    try {
        
    
        req.session.destroy()
        
        res.redirect('/')
    
    } catch(err) {
        console.log(err)
    }
    
}

const userHomePage = async(req,res) => {
    try {
        let cartCount;
        let cartItems;
        let wishlistItems
        if(req.session.user){
        const userId = req.session.user._id
        cartCount = await cartData.aggregate([{$match:{userId}},{$project:{count:{$size:"$cartItems"}}}]);
        cartItems = await cartData.findOne({userId})
        wishlistItems = await wishlistData.findOne({userId})
    }
        console.log(req.body)
        const products = await productData.find({deleted:false}).limit(4)
        const categories = await categoryData.find({})
        const courosels = await productData.find({$and:[{
            discount:{$gt:10}},{deleted:false}] 
        }).sort({discount:-1})
        
        
            
        const justArrived = await productData.find({$and:[{
            expiresAt:{$gte: Date.now()}},{deleted:false}]
        }).limit(4)
        // console.log(justArrived)
        // console.log(courosels)
        res.render('user/index',{products,categories,courosels,justArrived,cartCount,cartItems,wishlistItems})
    }catch(err) {
        console.log(err)
    }
}




const userProfile = async(req,res) => {
    try {
        console.log(req.params.id)
        const userId = req.params.id
        console.log(userId)
        const address = await addressData.find({userId})
        console.log(address)
        res.render('user/profile',{address})
    } catch(err) {
        console.log(err)
    }
}

const addAddress = async(req,res) => {
    try{
        res.render('user/addAddress')
    } catch(err) {
        console.log(err)
    }
}

const saveAddress = async(req,res) => {
    try {
        const {id} = req.params

        // const address = await addressData.findOne({userId:id})
        
        // const {houseNo, street, district, state, pincode} = req.body

        // console.log({houseNo, street, district, state, pincode})
        const count = await addressData.find({id}).count()
        console.log(count)

        if(!req.body) {
            req.flash('error','Empty fields are not allowed')
            res.redirect('/addAddress')
        } 
        // else if(address){
        //     req.flash("error",'Cannot use multiple addresses')
        //     res.redirect('/addAddress')
        // }
        // if(count == 2) {
        //     req.flash('error','You cannot add more than two addresses')
        //     res.redirect('back')
        // }
         else {
            const addr = await new addressData({
                userId: id,
                
                houseNo: req.body.houseNo,
                street: req.body.street,
                district: req.body.district,
                state: req.body.state,
                pincode: req.body.pincode
                
            })
            // console.log(addr)
            addr.save()
            .then(() => {
                req.flash('success','Address successfully added')
                res.redirect('/addAddress')
            })
            .catch((err) => {
                console.log(err)
            })

            
        }
    } catch(err) {
        console.log(err)
    }

}


const deleteAddress = async(req,res) => {
    try {
        const id = req.params.id

        const deletion = await addressData.findOneAndDelete({id})
        deletion.remove()
        req.flash('success','Address successfully deleted')
        res.redirect('back')
    } catch(err) {
        console.log(err)
    }
}

// const saveChangedAddress = async(req,res) => {
//     try {
//         const userId = req.params.id
//         const address = await addressData.updateOne({userId},{...req.body})
//         req.flash('success','Address updated successfully')
//         res.redirect('back')

//     } catch(err) {
//         console.log(err)
//     }
// }







module.exports = {
    signupPage,
    otpPage,
    verifyOTP,
    loginPage,
    resendOTPCode,
    homePage,
    
    logout,
    userHomePage,
    getOtpPage,
    userProfile,
    saveAddress,
    addAddress,
    deleteAddress,
    
    // saveChangedAddress,
   
    
}