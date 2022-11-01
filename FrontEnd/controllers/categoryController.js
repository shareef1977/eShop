const productData = require('../models/productModel')
const categoryData = require('../models/categoryModel')
const wishlistData = require('../models/wishlistModel')
const cartData = require('../models/cartModel')


const singleProduct = async (req,res) => {
    try {
        const catId = req.params.id
        const category = await categoryData.findById({_id:catId})
        // console.log(category)
        const cata = category.name
        // console.log(cata)



        const products = await productData.find({$and:[{
            category:{$eq:cata}},{deleted:false}]
        })
        // console.log(products) 
        const justArrived = await productData.find({
            $and:[{category:{$eq:cata}},{expiresAt:{$gte: Date.now()}}]
        })
        const categories = await categoryData.find({})
        const courosels = await productData.find({ $and:[{
            discount:{$gt:10}},{deleted:false}]
        })
        const userId = req.session.user._id
        const cartItems = await cartData.findOne({userId})
        const wishlistItems = await wishlistData.findOne({userId})

        res.render('user/singleProduct',{products,justArrived,categories,courosels,cartItems,wishlistItems,cata})
    }
    catch(err) {
        console.log(err)
    }
}




const adminSingleProduct = async(req,res) => {
    try {
        
        const catId = req.params.id
        const category = await categoryData.findById({_id:catId})
        // console.log(category)
        const cata = category.name
        // console.log(cata)


        const products = await productData.find({$and:[{
            category: {$eq: cata}},{deleted:false}]
        })

        res.render('admin/singleProduct',{products})
    } catch(err) {
        console.log(err)
    }
}


module.exports = {
    singleProduct,
   
    adminSingleProduct,
   
}