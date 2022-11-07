require('dotenv').config()

const userData = require('../models/userModel')
const checkoutData = require('../models/checkoutModel')
const coupenData = require('../models/coupenModel')
const addressData = require('../models/addressModel')
const cartData = require('../models/cartModel')
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
            const cartList = await cartData.aggregate([{$match:{userId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
            
            const items = await cartData.findOne({userId})
            let coupencode 
            if(items.coupenCode){
                coupencode = items.coupenCode
            }
            
            let discount;
            if(coupencode) {
                const coupens = await coupenData.findOne({code:coupencode})
                discount = coupens.discount
            }
        let total;
        let subtotal = 0;
        
        cartList.forEach((p) => {
            p.product.forEach((p2)=> {
                total = parseInt(p2.price)*parseInt(p.itemQuantity)
                subtotal += total
            })
        })
        let shipping ;
        if(subtotal < 15000) {
            shipping = 50
        } else {
            shipping = 0
        }
        let grandtotal
        if(discount) {
            grandtotal = subtotal+shipping-discount
        } else {
            grandtotal = subtotal+shipping
        }
            res.render('user/checkout',{user,address,cartList,grandtotal,shipping,subtotal,discount})
        } else {
            req.flash('error','You are not logged in')
            res.redirect('back')
        }
    } catch(err) {
        res.render('error',{err})
    }
}

const placeOrder = async(req,res) => {
    try {
        const usrId = req.session.user._id
        const userId = new mongoose.Types.ObjectId(usrId)
        const prodId = req.body.cartId
        const cartId = new mongoose.Types.ObjectId(prodId)
        const items = await cartData.findById({_id:cartId})
        const coupencode = items.coupenCode
        let discount;
        if(coupencode) {
            const coupens = await coupenData.findOne({code:coupencode})
            discount = coupens.discount

        }
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
        const shipping = 50;
        const bill = subtotal + shipping
        let status = req.body.payment === 'cod'? false:true

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
            discount,
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
                generateRazorpay(orderId,total).then((response) => {
                    res.json(response)
                })
            }
            
        })
        .catch((err) => {
            res.render('error',{err})
        })
        
        await cartData.deleteOne({_id:cartId})
    } catch(err) {
        res.render('error',{err})
    }
}

const orderSuccess = async(req,res) => {
    try{
        const userId = req.session.user._id
        const productId = req.params
        const cartList = await cartData.aggregate([{$match:{_id:productId}},{$unwind:'$cartItems'},
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
        let shipping = 0;
        if(subtotal < 15000) {
            shipping = 150
        } else {
            shipping = 0
        }
        const bill = subtotal+shipping
        const orderData = await checkoutData.find({userId})
        res.render('user/orderSuccess',{cartList,bill,shipping,orderData})
    } catch(err) {
        res.render('error',{err})
    }
}

const verifyPay = async(req,res) => {
    verifyPayment(req.body).then(() => {
        changePaymentStatus(req.body).then(() => {
            res.json({status:true})
        }).catch((err) => {
            res.json({status:false,errMsg:''})
        })
    }).catch((err) => {
        res.render('error',{err})
    })
}

function changePaymentStatus(orderId) {
    return new Promise((resolve,reject) => {
        const Id = mongoose.Types.ObjectId(orderId.id)
        checkoutData.findByIdAndUpdate({_id:Id},{$set:{
                isCompleted: true
            }}).then(()=>{
                resolve()
            }).catch((err) => {
                res.render('error',{err})
            })
       
    })
}

const viewOrders = async(req,res) => {
    try{
        userId = req.session.user._id
        const orderData = await checkoutData.find({userId}).sort({'orderStatus.date':-1})
        res.render('user/orderDetails',{orderData})
    } catch(err) {
        res.render('error',{err})
    }
}

const orderedProducts = async(req,res) => {
    try{
        
        const cartId = mongoose.Types.ObjectId(req.body)
        const cartList = await checkoutData.aggregate([{$match:{_id:cartId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
        
        res.send({cartList})
    } catch(err) {
        res.render('error',{err})
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
        res.render('error',{err})
    }
    
}

const cancelOrder = async(req,res) => {
    try {
        const {id} = req.params
        await checkoutData.findByIdAndUpdate(id,{
            orderStatus: {
                type: "Cancelled"
            },
            isCompleted: false
        })
        res.send({status:true})
    } catch(err) {
        res.render('error',{err})
    }
}

module.exports = {
    checkoutPage,
    placeOrder,
    orderSuccess,
    verifyPay,
    viewOrders,
    orderedProducts,
    checkoutAddress,
    cancelOrder
}