require('dotenv').config()
const userData = require('../models/userModel')
const productData = require('../models/productModel')
const cartData = require('../models/cartModel')
const mongoose = require('mongoose')

const addToCart = async (req, res) => {
    try {
        if (req.session.user) {
            const prodId = req.params.id
            const productId = new mongoose.Types.ObjectId(prodId)
            const userId = req.session.user._id
            const item = await productData.findOne({ _id: productId })
            const price = item.price
            const detail = await userData.findById({ _id: userId })
            if (detail.blockStatus == false) {
                const userExist = await cartData.findOne({ userId })
                if (userExist) {
                    const productExist = await cartData.findOne({
                        $and: [{ userId }, {
                            cartItems: {
                                $elemMatch: {
                                    productId
                                }
                            }
                        }]
                    })

                    if (productExist) {
                        await cartData.findOneAndUpdate({ $and: [{ userId }, { "cartItems.productId": productId }] }, { $inc: { "cartItems.$.quantity": 1 } })
                        res.send({ success: true })
                    } else {
                        await cartData.updateOne({ userId }, { $push: { cartItems: { productId, quantity: 1, price } } })
                        res.send({ success: true })
                    }
                } else {
                    const cart = new cartData({
                        userId, cartItems: [{ productId, quantity: 1, price }]
                    })
                    await cart.save()
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

const userCart = async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user._id
            const cartList = await cartData.aggregate([{ $match: { userId } }, { $unwind: '$cartItems' },
            { $project: { item: '$cartItems.productId', itemQuantity: '$cartItems.quantity' } },
            { $lookup: { from: process.env.PRODUCT_COLLECTION, localField: 'item', foreignField: '_id', as: 'product' } }]);

            let total;
            let subtotal = 0;

            cartList.forEach((p) => {
                p.product.forEach((p2) => {
                    total = parseInt(p2.price) * parseInt(p.itemQuantity)
                    subtotal += total
                })
            })

            let shipping = 0;
            if (subtotal < 15000) {
                shipping = 150
            } else {
                shipping = 0
            }
            const grandtotal = subtotal + shipping
            res.render('user/cart', { cartList, subtotal, total, shipping, grandtotal })
        } else {
            req.flash('error', 'you are not logged in')
            res.redirect('back')
        }
    } catch (err) {
        res.render('error',{err})
    }
}

const itemInc = async (req, res) => {
    try {
        const prodId = req.params
        const productId = mongoose.Types.ObjectId(prodId)
        const userId = req.session.user._id
        const detail = await userData.findById({ _id: userId })
        
        if (detail.blockStatus == false) {
            const userExist = await cartData.findOne({ userId })
            if (userExist) {

                const productExist = await cartData.findOne({
                    $and: [{ userId }, {
                        cartItems: {
                            $elemMatch: {
                                productId
                            }
                        }
                    }]
                })
                
                if (productExist) {
                    await cartData.findOneAndUpdate({ $and: [{ userId }, { "cartItems.productId": productId }] }, { $inc: { "cartItems.$.quantity": 1 } })
                    let quantity = 0
                    req.flash('success', 'Item added to cart successfully')
                    res.send({ success: true })
                } else {
                    req.flash('error', 'Unable to add item!!!')
                    res.redirect('back')
                }
            } else {
                req.flash('error', 'You are not logged in')
            }
        } else {
            req.flash('error', 'You are unable to access the product')
            res.redirect('back')
        }

    } catch (err) {
        res.render('error',{err})
    }
}

const itemDec = async (req, res) => {
    try {
        const prodId = req.params.id
        const productId = new mongoose.Types.ObjectId(prodId)
        const userId = req.session.user._id
        const detail = await userData.findById({ _id: userId })

        if (detail.blockStatus == false) {
            const userExist = await cartData.findOne({ userId })

            if (userExist) {
                const productExist = await cartData.findOne({
                    $and: [{ userId }, {
                        cartItems: {
                            $elemMatch: {
                                productId
                            }
                        }
                    }]
                })

                if (productExist) {
                    await cartData.findOneAndUpdate({ $and: [{ userId }, { "cartItems.productId": productId }] }, { $inc: { "cartItems.$.quantity": -1 } })
                    req.flash('success', 'Item removed from cart successfully')
                    res.send({ success: true })
                } else {
                    req.flash('error', 'Unable to delete item!!!')
                    res.redirect('back')
                }
            } else {
                req.flash('error', 'You are not logged in')
            }
        } else {
            req.flash('error', 'You are unable to access the product')
            res.redirect('back')
        }
    } catch (err) {
        res.render('error',{err})
    }
}
const itemDelete = async (req, res) => {
    try {
        const prodId = req.params.id
        const productId = new mongoose.Types.ObjectId(prodId)
        const userId = req.session.user._id
        const detail = await userData.findById({ _id: userId })
        if (detail.blockStatus == false) {
            await cartData.updateOne({ userId }, { $pull: { cartItems: { "productId": productId } } })
            res.send({ success: true })
        } else {
            req.flash('error', 'You are unable to access the product')
            res.redirect('back')
        }

    } catch (err) {
        res.render('error',{err})
    }
}



module.exports = {
    addToCart,
    itemInc,
    itemDec,
    itemDelete,
    userCart,
}