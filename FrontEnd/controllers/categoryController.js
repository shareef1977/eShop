const productData = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const wishlistData = require('../models/wishlistModel')
const cartData = require('../models/cartModel')


const singleProduct = async (req,res) => {
    try {
        const catId = req.params.id
        const category = await categoryData.findById({_id:catId})
        const cata = category.name
        const products = await productData.find({$and:[{
            category:{$eq:cata}},{deleted:false}]
        })
        const justArrived = await productData.find({
            $and:[{category:{$eq:cata}},{expiresAt:{$gte: Date.now()}}]
        })
        const categories = await categoryData.find({})
        const courosels = await productData.find({ $and:[{
            discount:{$gt:10}},{deleted:false}] 
        })
        let cartItems 
        let wishlistItems 
        if(req.session.user){
            const userId = req.session.user._id
            cartItems = await cartData.findOne({userId})
            wishlistItems = await wishlistData.findOne({userId})
        }
        res.render('user/singleProduct',{products,justArrived,categories,courosels,cartItems,wishlistItems,cata})
    }
    catch(err) {
        res.render('error',{err})
    }
}




const adminSingleProduct = async(req,res) => {
    try {
        
        const catId = req.params.id
        const category = await categoryData.findById({_id:catId})
        const cata = category.name
        const products = await productData.find({
            category: {$eq: cata}
        })
        res.render('admin/singleProduct',{products})
    } catch(err) {
        res.render('error',{err})
    }
}

module.exports = {
    singleProduct,
    adminSingleProduct,
}