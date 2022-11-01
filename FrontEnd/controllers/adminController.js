require('dotenv').config()

const adminData = require('../models/adminModel')
const productData = require('../models/productModel')
const userData = require('../models/userModel')
const brandData = require('../models/brandModel')
const categoryData = require('../models/categoryModel')
const checkoutData = require('../models/checkoutModel')

const mongoose = require('mongoose')

const bcrypt = require('bcrypt')

const { hashPassword,
        comparePassword,
} = require('../utils/helpers')


const adminHomePage = async(req,res) => {
    try {

        // const daySales = await checkoutData.aggregate([{$match:{$lt:{createdAt:Date.now()}}}])
        // console.log(daySales)
        res.render('admin/adminHome')
    } catch(err) {
        console.log(err)
    }
}


const adminLogin = async(req,res) => {
   try {
     // await adminData.create({name:'shareef',email:'shareefmohammedmm@gmail.com',password:hashedPassword},
    // {name:'yaser',email:'yaser@gmail.com',password:hashedPassword})
    
    res.render('admin/adminLogin')
   }catch(err){
    console.log(err)
   }
}



const adminHome = async(req,res) => {

    try{
        const {email,password} = req.body
        const admin = await adminData.findOne({email})
    
        if(!admin) {req.flash('error','Invalid Email or Password')
          res.redirect('/adminLogin')
        } else {
    
    
        const isValid = comparePassword(password,admin.password)
        // console.log(password)
        // console.log(admin.password)

        if(isValid) {
            req.session.admin = admin
            req.flash('success','You are successfully logged in...')
            res.redirect('/adminHome')
        } else {
            req.flash('error','Invalid Password')
            res.redirect('/adminLogin')
        }
    } 

    } catch(err){
        console.log(err)
    }
}


const adminCategory = async(req,res) => {

    try{
       const categories = await categoryData.find({})
       
    
        res.render('admin/adminCategory',{categories})
    } catch(err) {
        console.log(err)
    }
}

const adminBrand = async(req,res) => {
    try {
        
        const brands = await brandData.find({})
        res.render('admin/adminBrand',{brands}) 
    } catch (err){
        console.log(err)
    }
}

const adminUser = async(req,res) => {

   try{
        const users = await userData.find({})
        res.render('admin/adminUser',{users})
   } catch(err) {
        console.log(err)
   }
}



const logout = async(req,res) => {

    try {
        req.session.destroy()
        res.redirect('/adminLogin')
    } catch(err) {
        console.log(err)
    }
    
   
}




const editUser = async(req,res) => {
    try {
        const {id} = req.params

        const user = await userData.findById(id)

        if(user.blockStatus == false){
            await userData.findByIdAndUpdate(id,{blockStatus: true})
            res.redirect('/adminUser')
        } else {
            await userData.findByIdAndUpdate(id,{blockStatus: false})
            res.redirect('/adminUser')
        }
    } catch(err) {
        console.log(err)
    }
}

const productOrders = async(req,res) => {
    try {
        const orderData = await checkoutData.find({}).sort({'orderStatus.date':-1})
        // console.log(orderData)

        
        orderId = mongoose.Types.ObjectId(orderData._Id)
        // console.log(orderId)
        // const userDetail = await userData.findById({_id: userId})
        // console.log(userDetail)
        res.render('admin/orders',{orderData,orderId})
    } catch(err) {
        console.log(err)
    }
}

const orderItems = async(req,res) => {
    try{
        const carId = req.params
        const cartId = mongoose.Types.ObjectId(carId)
        const cartList = await checkoutData.aggregate([{$match:{_id:cartId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
        
        res.render('admin/orderItems',{cartList})
    } catch(err) {
        console.log(err)
    }
}

const editOrder = async(req,res) => {
    try{
        const {id} = req.params
        const orderData = await checkoutData.findById(id)
        console.log(orderData)
        res.render('admin/editOrder',{orderData})

    } catch(err) {
        console.log(err)
    }
}


const updateOrder = async(req,res) => {
    try {
        const {id} = req.params
        await checkoutData.findByIdAndUpdate(id,{
            
            orderStatus: {
                type: req.body.orderStatus,
                date: req.body.date 

            }
        })
        const orderData = await checkoutData.findById(id)
        if(orderData.orderStatus[0].type == 'Delivered'&&orderData.paymentStatus == 'cod') {
            await checkoutData.findByIdAndUpdate(id,{
                isCompleted: true
            })
        } else {
            await checkoutData.findOneAndUpdate({$and:[{_id:id},{paymentStatus:'cod'}]},{
                isCompleted: false
            })
        }
        req.flash('success','Order updated Successfully')
        res.redirect('/orders')
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    adminLogin,
    adminHome,
    adminCategory,
    adminBrand,
    adminUser,
    logout,
    adminHomePage,
    editUser,
    productOrders,
    orderItems,
    updateOrder,
    editOrder
}

