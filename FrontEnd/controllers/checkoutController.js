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
    generateRazorpay
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
        console.log(req.body)
        const usrId = req.session.user._id
        
        const userId = new mongoose.Types.ObjectId(usrId)
      
       
        // console.log(prodId)
        
        const cartId = req.body.cartId
        // console.log(cartId)
        // const cartId = new mongoose.Types.ObjectId(prodId)
        // console.log(userId)
        // console.log(cartId)
        const cartList = await cartData.aggregate([{$match:{_id:cartId}},{$unwind:'$cartItems'},
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
        const shipping = 50;
        const bill = subtotal+shipping

        await cartData.deleteOne({_id:cartId})

        // const checked = req.body.checkBox
        // if(checked) {
        //     houseNo2 = req.body.houseNo2



        // }
        

        const orderData = new checkoutData ({
            userId,cartList,
            address: {
               name: req.body.name,
               email: req.body.email, 
               mobile: req.body.mobile,
               addressLine: req.body.addressLine
            },
            paymentStatus: req.body.payment,
            orderStatus:
            bill,
            date: Date.now()

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
    } catch(err) {
        console.log(err)
    }
}

const orderSuccess = async(req,res) => {
    try{
        const userId = req.session.user._id
        const productId = req.params
        
        // const productId = new mongoose.Types.ObjectId(prodId)
        // console.log(userId)
        console.log(productId)
        const cartList = await cartData.aggregate([{$match:{_id:productId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
        console.log(cartList)
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
        console.log(orderData)
        res.render('user/orderSuccess',{cartList,bill,shipping,orderData})
    } catch(err) {
        console.log(err)
    }
}

const verifyPay = async(req,res) => {
    console.log(req.body);
    body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', 'YOUR_SECRET_KEY')
                                    .update(body.toString())
                                    .digest('hex');
                                    console.log("sig"+req.body.razorpay_signature);
                                    console.log("sig"+expectedSignature);
    
    if(expectedSignature === req.body.razorpay_signature){
      console.log("Payment Success");
    }else{
      console.log("Payment Fail");
    }
}
// const oneItemCheckout = async(req,res) => {
//     try {
//         const productId = req.params.id
//         const userId = req.session.user._id
//         const cartList = await productData.findById({_id:productId})
//         const shipping = 250
//         const address = await addressData.find({userId})

//         res.render('user/singleItemCheckout',{cartList,shipping,address})
//     } catch(err) {
//         console.log(err)
//     }
// }

// const singleItemPlaceOrder = async(req,res) => {
//     try{
//         const userId = req.session.user._id
//         const prodId = req.params
//         const productId = new mongoose.Types.ObjectId(prodId)
//         // console.log(userId)
//         // console.log(productId)
//         const product = await productData.findById({_id:productId})
//         console.log(product)
        
//         let subtotal = parseInt(product.price);
        
       
//         const shipping = 250;
//         const bill = subtotal+shipping

        

//         // const checked = req.body.checkBox
//         // if(checked) {
//         //     houseNo2 = req.body.houseNo2



//         // }
        

//         const orderData = new checkoutData ({
//             userId,productId,
//             address: {
//                name: req.body.name,
//                email: req.body.email,
//                mobile: req.body.mobile,
//                addressLine: req.body.address
//             },
//             paymentStatus: req.body.payment,
//             bill

//         })

//         orderData
//         .save()
//         .then(() => {
//             if(orderData.paymentStatus == 'cod'){
//                 res.render('user/singleOrderSuccess',{product,bill,orderData,shipping})
//             }
            
//         })
//         .catch((err) => {
//             console.log(err)
//         })
//     } catch(err) {
//         console.log(err)
//     }
// }

module.exports = {
    checkoutPage,
    placeOrder,
    orderSuccess,
    verifyPay,
    // oneItemCheckout,
    // singleItemPlaceOrder
}