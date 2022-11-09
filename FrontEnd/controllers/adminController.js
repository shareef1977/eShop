require('dotenv').config()

const adminData = require('../models/adminModel')
const userData = require('../models/userModel')
const brandData = require('../models/brandModel')
const categoryData = require('../models/categoryModel')
const checkoutData = require('../models/checkoutModel')

const mongoose = require('mongoose')

const {
    hashPassword,
    comparePassword
} = require('../utils/helpers')


const adminHomePage = async (req, res) => {
    try {
        const dailySale = await checkoutData.find({ $and: [{ createdAt: { $lt: Date.now(), $gt: Date.now() - 86400000 } }, { 'orderStatus.type': { $ne: 'Cancelled' } }] })
        let todaySale = 0
        dailySale.forEach((s) => {
            todaySale += s.bill
        })
        let totalSale = 0


        const sale = await checkoutData.find({ 'orderStatus.type': { $ne: 'Cancelled' } })
        sale.forEach((s) => {
            totalSale += s.bill
        })
        todayRevenue = todaySale * 10 / 100
        totalRevenue = totalSale * 10 / 100
        const completed = await checkoutData.find({ isCompleted: true }).sort({ createdAt: -1 }).limit(10)
        const graph = await checkoutData.aggregate(
            [
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" }, year: { $year: "$createdAt" } },
                        totalPrice: { $sum: '$bill' },
                        count: { $sum: 1 }

                    }

                }, { $sort: { _id: -1 } },
                { $project: { totalPrice: 1, _id: 0 } }, { $limit: 7 }
            ]
        );

        let values = [];
        let revenue = []
        graph.forEach((g) => {
            values.push(g.totalPrice)
            revenue.push(g.totalPrice * 10 / 100)
        })

        const ordered = await checkoutData.find({ 'orderStatus.type': 'Ordered' }).count()
        const packed = await checkoutData.find({ 'orderStatus.type': 'Packed' }).count()
        const shipped = await checkoutData.find({ 'orderStatus.type': 'Shipped' }).count()
        const delivered = await checkoutData.find({ 'orderStatus.type': 'Delivered' }).count()
        const cancelled = await checkoutData.find({ 'orderStatus.type': 'Cancelled' }).count()


        res.render('admin/adminHome', { todaySale, totalSale, todaySale, totalRevenue, completed, values, revenue, ordered, packed, shipped, delivered, cancelled })
    } catch (err) {
        res.render('error')
    }
}


const adminLogin = async (req, res) => {
    try {
        const admin = await adminData.find({})
        
        if(admin.length == 0){
            const password = '123456'
            const newAdmin = new adminData({
                name: 'Shareef',
                email:'shareefmohammedmm@gmail.com',
                password:hashPassword(password)
            })
            newAdmin.save()
        }
        res.render('admin/adminLogin')
    } catch (err) {
        res.render('error')
    }
}



const adminHome = async (req, res) => {

    try {
        const { email, password } = req.body
        const admin = await adminData.findOne({ email })

        if (!admin) {
            req.flash('error', 'Invalid Email or Password')
            res.redirect('/adminLogin')
        } else {


            const isValid = comparePassword(password, admin.password)
            
            if (isValid) {
                req.session.admin = admin
                req.flash('success', 'You are successfully logged in...')
                res.redirect('/adminHome')
            } else {
                req.flash('error', 'Invalid Password')
                res.redirect('/adminLogin')
            }
        }

    } catch (err) {
        res.render('error', { err })
    }
}

const adminCategory = async (req, res) => {
    try {
        const categories = await categoryData.find({ deleteStatus: false })
        res.render('admin/adminCategory', { categories })
    } catch (err) {
        res.render('error',{err})
    }
}

const adminBrand = async (req, res) => {
    try {
        const brands = await brandData.find({ deleteStatus: false })
        res.render('admin/adminBrand', { brands })
    } catch (err) {
        res.render('error', { err })
    }
}

const adminUser = async (req, res) => {

    try {
        const users = await userData.find({})
        res.render('admin/adminUser', { users })
    } catch (err) {
        res.render('error', { err })
    }
}



const logout = async (req, res) => {

    try {
        req.session.destroy()
        res.redirect('/adminHome')
    } catch (err) {
        res.render('error', { err })
    }


}




const editUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await userData.findById(id)

        if (user.blockStatus == false) {
            await userData.findByIdAndUpdate(id, { blockStatus: true })
            res.send({ success: true })
        } else {
            await userData.findByIdAndUpdate(id, { blockStatus: false })
            res.send({ success: true })
        }
    } catch (err) {
        res.render('error', { err })
    }
}

const productOrders = async (req, res) => {
    try {
        const orderData = await checkoutData.find({}).sort({ 'orderStatus.date': -1 })
        orderId = mongoose.Types.ObjectId(orderData._Id)
        res.render('admin/orders', { orderData, orderId })
    } catch (err) {
        res.render('error',{err})
    }
}

const orderItems = async (req, res) => {
    try {
        const carId = req.body
        const cartId = mongoose.Types.ObjectId(carId)
        const cartList = await checkoutData.aggregate([{ $match: { _id: cartId } }, { $unwind: '$cartItems' },
        { $project: { item: '$cartItems.productId', itemQuantity: '$cartItems.quantity' } },
        { $lookup: { from: process.env.PRODUCT_COLLECTION, localField: 'item', foreignField: '_id', as: 'product' } }]);

        res.send({ cartList })
    } catch (err) {
        res.render('error',{err})
    }
}

const editOrder = async (req, res) => {
    try {
        const { id } = req.params
        const orderData = await checkoutData.findById(id)
        res.render('admin/editOrder', { orderData })
    } catch (err) {
        res.render('error',{err})
    }
}


const updateOrder = async (req, res) => {
    try {
        const { id } = req.params
        await checkoutData.findByIdAndUpdate(id, {

            orderStatus: {
                type: req.body.orderStatus,
                date: req.body.date

            }
        })
        const orderData = await checkoutData.findById(id)
        if (orderData.orderStatus[0].type == 'Delivered' && orderData.paymentStatus == 'cod') {
            await checkoutData.findByIdAndUpdate(id, {
                isCompleted: true
            })
        } else {
            await checkoutData.findOneAndUpdate({ $and: [{ _id: id }, { paymentStatus: 'cod' }] }, {
                isCompleted: false
            })
        }
        req.flash('success', 'Order updated Successfully')
        res.redirect('/orders')
    } catch (err) {
        res.render('error',{err})
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

