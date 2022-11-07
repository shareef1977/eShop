require('dotenv').config()
const userData = require('../models/userModel')
const wishlistData = require('../models/wishlistModel')
const mongoose = require('mongoose')

const addToWishlist = async (req, res) => {
    try {
        if (req.session.user) {
            const prodId = req.params.id
            const productId = new mongoose.Types.ObjectId(prodId)
            const userId = req.session.user._id
            const detail = await userData.findById({ _id: userId })
            if (detail.blockStatus == false) {
                const userExist = await wishlistData.findOne({ userId })
                if (userExist) {
                    const productExist = await wishlistData.findOne({
                        $and: [{ userId }, {
                            wishlistItems: {
                                $elemMatch: {
                                    productId
                                }
                            }
                        }]
                    })
                    if (productExist) {
                        res.send({ success: false })
                    } else {
                        await wishlistData.updateOne({ userId }, { $push: { wishlistItems: { productId } } })
                        res.send({ success: true })
                    }
                } else {
                    const wishlist = new wishlistData({
                        userId, wishlistItems: [{ productId }]
                    })
                    await wishlist.save()
                        .then(() => {
                            res.send({ success: true })
                        })
                        .catch((err) => {
                            res.render('error',{err})
                        })
                }
            } else {
                req.flash('error', 'You are unable to access the product')
                res.redirect('back')
            }
        } else {
            req.flash('error', 'You are not logged in')
            res.redirect('back')
        }
    } catch (err) {
        res.render('error',{err})
    }
}

const userWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id
        const { prodId } = req.params.id
        const productId = new mongoose.Types.ObjectId(prodId)
        const wishlistProducts = await wishlistData.aggregate([{ $match: { userId } }, { $unwind: '$wishlistItems' },
                                                                { $project: { item: '$wishlistItems.productId' } },
                                                                { $lookup: { from: process.env.PRODUCT_COLLECTION, localField: 'item', foreignField: '_id', as: 'product' } }]);
        res.render('user/wishlist', { wishlistProducts })
    } catch (err) {
        res.render('error',{err})
    }
}

const deleteWishlist = async (req, res) => {
    try {
        const prodId = req.params.id
        const productId = new mongoose.Types.ObjectId(prodId)
        const userId = req.session.user._id
        const detail = await userData.findById({ _id: userId })
        if (detail.blockStatus == false) {
            await wishlistData.updateOne({ userId }, { $pull: { wishlistItems: { "productId": productId } } })
            res.send({ success: true })
        } else {
            req.flash('error', 'You are unable to access the product')
            res.send({ success: false })
        }
    } catch (err) {
        res.render('error',{err})
    }
}

module.exports = {
    addToWishlist,
    userWishlist,
    deleteWishlist
}