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




const addToCart = async(req,res) => {
    
    try {
        if(req.session.user){
        const prodId = req.params.id
        // console.log(req.params)
        const productId = new mongoose.Types.ObjectId(prodId)
       
        
        const userId = req.session.user._id
        // console.log(productId)
       
        const item = await productData.findOne({_id: productId})
        const price = item.price

        const detail = await userData.findById({_id:userId})
        // console.log(detail)
        if(detail.blockStatus == false) {
        const userExist = await cartData.findOne({ userId })
        // console.log(userExist)

        if (userExist) {
            const productExist = await cartData.findOne({$and: [{userId},{cartItems: {$elemMatch: {
                productId
            }}}]})

            if(productExist) {
                await cartData.findOneAndUpdate({$and: [{userId},{"cartItems.productId":productId}]}, {$inc:{"cartItems.$.quantity":1}})
                // req.flash('success','Item added to cart successfully')
                res.send({success:true})
            } else {
                await cartData.updateOne({userId},{$push: {cartItems:{productId,quantity:1,price}}})
                
                // req.flash('success','Item added to cart successfully')
                res.send({success:true})
            }
        } else {
            const cart = new cartData ({
                userId,cartItems: [{productId,quantity:1,price}]

            })
            await cart.save()
            .then(() => {
                // req.flash('success','Item added to cart successfully')
                res.send({success:true})
            })
            .catch((err) =>{
                console.log(err)
            })
        }
        const cartCount = await cartData.aggregate([{$match: {userId}},{$project:{count:{$size:"$cartItems"}}}])
    } else {
        req.flash('error','You are unable to access the product')
        res.redirect('back')
    }
    } else {
        req.flash('error','You are not logged in')
        res.redirect('back')
    }
    } catch(err) {
        console.log(err)
    }
}

const userCart = async(req,res) => {
    try {
        if(req.session.user){
        const userId = req.session.user._id
        // console.log(userId)
        const {prodId} = req.params.id
        // console.log(req.params)
        
        const productId = new mongoose.Types.ObjectId(prodId)
        // console.log(productId)
        // const cartItems = await cartData.findById(id)
        // console.log(cartItems)
        const cartList = await cartData.aggregate([{$match:{userId}},{$unwind:'$cartItems'},
                        {$project:{item:'$cartItems.productId',itemQuantity:'$cartItems.quantity'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
                        

        console.log(cartList[0].item)
        let total;
        let subtotal = 0;
        
        cartList.forEach((p) => {
            p.product.forEach((p2)=> {
                total = parseInt(p2.price)*parseInt(p.itemQuantity)
                subtotal += total
            })
        })
        
        let shipping = 0;
        if(subtotal < 15000){
            shipping = 150
        } else {
            shipping = 0
        }
        const grandtotal = subtotal+shipping
        // console.log(total)
        // console.log(subtotal)


        res.render('user/cart',{cartList,subtotal,total,shipping,grandtotal})
    } else {
        req.flash('error','you are not logged in')
        res.redirect('back')
    }
    } catch(err) {
        console.log(err)
    }
}

const itemInc = async(req,res) => {
    try{
        const prodId = req.params
        // console.log(prodId)
        const productId = mongoose.Types.ObjectId(prodId)
        // console.log(productId)
        
        const userId = req.session.user._id
        
       

        const detail = await userData.findById({_id:userId})
        // console.log(detail)
        if(detail.blockStatus == false) {
        const userExist = await cartData.findOne({ userId })
        // console.log(userExist)
        // console.log("hello",userExist)
        if (userExist) {

            const productExist = await cartData.findOne({$and: [{userId},{cartItems: {$elemMatch: {
                productId
            }}}]})
            // console.log("hello",productExist)
            if(productExist) {
                await cartData.findOneAndUpdate({$and: [{userId},{"cartItems.productId":productId}]}, {$inc:{"cartItems.$.quantity":1}})
                console.log(productExist)
                let quantity = 0
               


                req.flash('success','Item added to cart successfully')
                res.send({success:true})
            } else {
                
                
                req.flash('error','Unable to add item!!!')
                res.redirect('back')
            }
        } else {
           
                req.flash('error','You are not logged in')
           
        }
        const cartCount = await cartData.aggregate([{$match: {userId}},{$project:{count:{$size:"$cartItems"}}}])
    } else {
        req.flash('error','You are unable to access the product')
        res.redirect('back')
    }

    } catch(err) {
        console.log(err)
    }
}

const itemDec = async(req,res) => {
    try{
        const prodId = req.params.id
        // console.log(req.params)
        const productId = new mongoose.Types.ObjectId(prodId)
       
        
        const userId = req.session.user._id
        // console.log(productId)
       

        const detail = await userData.findById({_id:userId})
        // console.log(detail)
        if(detail.blockStatus == false) {
        const userExist = await cartData.findOne({ userId })
        // console.log(userExist)

        if (userExist) {
            const productExist = await cartData.findOne({$and: [{userId},{cartItems: {$elemMatch: {
                productId
            }}}]})

            if(productExist) {
                
                    await cartData.findOneAndUpdate({$and: [{userId},{"cartItems.productId":productId}]}, {$inc:{"cartItems.$.quantity":-1}})
                    req.flash('success','Item removed from cart successfully')
                    res.send({success:true})
                
                   
                
            } else {
                
                
                req.flash('error','Unable to delete item!!!')
                res.redirect('back')
            }
        } else {
           
                req.flash('error','You are not logged in')
           
        }
        const cartCount = await cartData.aggregate([{$match: {userId}},{$project:{count:{$size:"$cartItems"}}}])
    } else {
        req.flash('error','You are unable to access the product')
        res.redirect('back')
    }

    } catch(err) {
        console.log(err) 
    }
}

const itemDelete = async(req,res) => {
    try {
        const prodId = req.params.id
        console.log(req.params)
        const productId = new mongoose.Types.ObjectId(prodId)
       
        
        const userId = req.session.user._id
        console.log(productId)
       

        const detail = await userData.findById({_id:userId})
        console.log(detail)
        if(detail.blockStatus == false) {
            await cartData.updateOne({userId},{$pull: {cartItems:{"productId":productId}}})
                
            // req.flash('success','Item removed from cart successfully')
            res.send({success:true})
        } else {
            req.flash('error','You are unable to access the product')
            res.redirect('back')
        }

    } catch(err) {
        console.log(err)
    }
}



module.exports = {
    addToCart,
    itemInc,
    itemDec,
    itemDelete,
    userCart,
}