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

const addToWishlist = async(req,res) => {
    try {
        if(req.session.user){
        const prodId = req.params.id
        // console.log(req.params)
        const productId = new mongoose.Types.ObjectId(prodId)
       
        
        const userId = req.session.user._id
        // console.log(productId)
       

        const detail = await userData.findById({_id:userId})
        // console.log(detail)
        if(detail.blockStatus == false) {
        const userExist = await wishlistData.findOne({ userId })
        // console.log(userExist)

        if (userExist) {
            const productExist = await wishlistData.findOne({$and: [{userId},{wishlistItems: {$elemMatch: {
                productId
            }}}]})

            if(productExist) {
                
                req.flash('success','Item already added to wishlist')
                res.send({success:false})
            } else {
                await wishlistData.updateOne({userId},{$push: {wishlistItems:{productId}}})
                
                // req.flash('success','Item added to wishlist successfully')
                res.send({success:true})
            }
        } else {
            const wishlist = new wishlistData ({
                userId,wishlistItems: [{productId}]

            })
            await wishlist.save()
            .then(() => {
                // req.flash('success','Item added to wishlist successfully')
                res.send({success:true})
            })
            .catch((err) =>{
                console.log(err)
            })
        }
        const wishlistCount = await wishlistData.aggregate([{$match: {userId}},{$project:{count:{$size:"$wishlistItems"}}}])
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


const userWishlist = async(req,res) => {
    try {
        const userId = req.session.user._id
        // console.log(userId)
        const {prodId} = req.params.id
        // console.log(req.params)
        
        const productId = new mongoose.Types.ObjectId(prodId)
        // console.log(productId)
        // const cartItems = await cartData.findById(id)
        // console.log(cartItems)
        const wishlistProducts = await wishlistData.aggregate([{$match:{userId}},{$unwind:'$wishlistItems'},
                        {$project:{item:'$wishlistItems.productId'}},
                        {$lookup:{from:process.env.PRODUCT_COLLECTION,localField:'item',foreignField:'_id',as:'product'}}]);
                        
        // console.log(cartList)  
        
        res.render('user/wishlist',{wishlistProducts})
    } catch(err) {
        console.log(err)
    }
}
const deleteWishlist = async(req,res) => {
    try {
        const prodId = req.params.id
        console.log(req.params)
        const productId = new mongoose.Types.ObjectId(prodId)
       
        
        const userId = req.session.user._id
        console.log(productId)
       

        const detail = await userData.findById({_id:userId})
        console.log(detail)
        if(detail.blockStatus == false) {
            await wishlistData.updateOne({userId},{$pull: {wishlistItems:{"productId":productId}}})
                
            // req.flash('success','Item removed from wishlist successfully')
            res.send({success:true})
        } else {
            req.flash('error','You are unable to access the product')
            res.send({success:false})
        }

    } catch(err) {
        console.log(err)
    }
}


module.exports = {
    addToWishlist,
    userWishlist,
    deleteWishlist
}