require('dotenv').config()
const nodemailer = require('nodemailer')
const userData = require('../models/userModel')
const productData = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const brandData = require('../models/brandModel')
const addressData = require('../models/addressModel')
const cartData = require('../models/cartModel')
const wishlistData = require('../models/wishlistModel')
const checkoutData = require('../models/checkoutModel')
const mongoose = require('mongoose')


const {
    generateRazorpay,
    verifyPayment
} = require('../utils/helpers')

const checkoutPage = async(req,res) => {
    try {
        
        if(req.session.user){
            const userId = req.session.user._id   
            const user = await userData.findById(userId)
            const address = await addressData.find({userId})
            // console.log(address)
            const cartList = await cartData.aggregate([{$match:{userId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
                        
                
        let total;
        let subtotal = 0;
        
        cartList.forEach((p) => {
            p.product.forEach((p2)=> {
                total = parseInt(p2.price)*parseInt(p.itemQuantity)
                subtotal += total
            })
        })
        const shipping = 50;
        const grandtotal = subtotal+shipping
        // console.log(cartList)

            res.render('user/checkout',{user,address,cartList,grandtotal,shipping,subtotal})
        } else {
            req.flash('error','You are not logged in')
            res.redirect('back')
        }
    } catch(err) {
        console.log(err)
    }
}

const placeOrder = async(req,res) => {
   
    try {
        // console.log(req.body)
        const usrId = req.session.user._id
        
        const userId = new mongoose.Types.ObjectId(usrId)
                     
        const prodId = req.body.cartId
        const cartId = new mongoose.Types.ObjectId(prodId)
        const items = await cartData.findById({_id:cartId})
        console.log(items)
        
        const cartList = await cartData.aggregate([{$match:{userId:userId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
        
        let total;
        let subtotal = 0;
        
        cartList.forEach((p) => {
            p.product.forEach((p2)=> {
                total = parseInt(p2.price)*parseInt(p.itemQuantity)
                subtotal += total
            })
        })
      
        const shipping = 40;
        const bill = subtotal + shipping
        let status = req.body.payment === 'cod'? true:false

        

        const orderData = new checkoutData ({
            userId,
            cartItems: items.cartItems,
            address: {
               name: req.body.name,
               email: req.body.email, 
               mobile: req.body.mobile,
               addressLine: req.body.addressLine
            },
            paymentStatus: req.body.payment,
            orderStatus: {
                date:Date.now()
            },
            bill,
            isCompleted: status

        })
        orderData
        .save()
        .then((orderData) => {
           
            if(orderData.paymentStatus == 'cod') {
                const codSuccess = true
                res.send({codSuccess})
            } else {
                const orderId = orderData._id
                const total = orderData.bill
                console.log(orderId)
                generateRazorpay(orderId,total).then((response) => {
                    res.json(response)
                })
            }
            
        })
        .catch((err) => {
            console.log(err)
        })
        
        await cartData.deleteOne({_id:cartId})
    } catch(err) {
        console.log(err)
    }
}

const orderSuccess = async(req,res) => {
    try{
        const userId = req.session.user._id
        
        const productId = req.params
        console.log(productId)
        
        // const productId = new mongoose.Types.ObjectId(prodId)
        // console.log(userId)
        // console.log(productId)
        const cartList = await cartData.aggregate([{$match:{_id:productId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
        // console.log(cartList)
        let total;
        let subtotal = 0;
        
        cartList.forEach((p) => {
            p.product.forEach((p2)=> {
                total = parseInt(p2.price)*parseInt(p.itemQuantity)
                subtotal += total
            })
        })
        const shipping = 200;
        const bill = subtotal+shipping
        const orderData = await checkoutData.find({userId})
        // console.log(orderData)
        res.render('user/orderSuccess',{cartList,bill,shipping,orderData})
    } catch(err) {
        console.log(err)
    }
}

const verifyPay = async(req,res) => {
    
    
    verifyPayment(req.body).then(() => {
        
        changePaymentStatus(req.body).then(() => {
            
            console.log("payment successful")
            res.json({status:true})

        }).catch((err) => {
            console.log(err)
            res.json({status:false,errMsg:''})
        })
    }).catch((err) => {
        console.log(err)
    })
}

function changePaymentStatus(orderId) {
    return new Promise((resolve,reject) => {
        const Id = mongoose.Types.ObjectId(orderId.id)
        checkoutData.findByIdAndUpdate({_id:Id},{$set:{
            isCompleted:true
        }}).then(()=>{
            resolve()
        }).catch((err) => {
            console.log(err)
        })
    })
}

const viewOrders = async(req,res) => {
    try{
        userId = req.session.user._id
        
        const orderData = await checkoutData.find({userId}).sort({'orderStatus.date':-1})
        
        
        
        res.render('user/orderDetails',{orderData})
    } catch(err) {
        console.log(err)
    }
}

const orderedProducts = async(req,res) => {
    try{
        
        const carId = req.params
        const cartId = mongoose.Types.ObjectId(carId)
        const cartList = await checkoutData.aggregate([{$match:{_id:cartId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
        // console.log(cartList)
        
        res.send({cartList})
    } catch(err) {
        console.log(err)
    }
}

const checkoutAddress = async(req,res) => {
    try{
        const userId = req.session.user._id
        const cartList = await cartData.aggregate([{$match:{userId:userId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);

        res.render('user/checkoutAddAddress',{cartList})
    } catch(err) {
        console.log(err)
    }
    
}

module.exports = {
    checkoutPage,
    placeOrder,
    orderSuccess,
    verifyPay,
    viewOrders,
    orderedProducts,
    checkoutAddress
    
}