const coupenData = require('../models/coupenModel')
const cartData = require('../models/cartModel')

const coupens = async (req, res) => {
    try {
        const coupens = await coupenData.find({})
        res.render('admin/coupens', { coupens })
    } catch (err) {
        res.render('error',{err})
    }
}

const addCoupen = async (req, res) => {
    try {
        res.render('admin/addCoupen')
    } catch (err) {
        res.render('error',{err})
    }
}

const saveCoupen = async (req, res) => {
    try {
        const coupen = new coupenData({
            code: req.body.code,
            discount: req.body.discount
        })
        await coupen.save()
        req.flash('success', 'Coupen added successfully')
        res.redirect('/addCoupen')
    } catch (err) {
        res.render('error',{err})
    }
}

const deleteCoupen = async (req, res) => {
    try {
        const { id } = req.params
        await coupenData.findByIdAndDelete(id)
        res.send({ send: true })
    } catch (err) {
        res.render('error',{err})
    }
}


const applyCoupen = async (req, res) => {
    try {
        const usercode = req.params.id
        const code = await coupenData.find({ code: usercode })
        if (code) {
            if (code[0].expiresAt > Date.now()) {
                const userId = req.session.user._id
                await cartData.findOneAndUpdate({ userId }, { coupenCode: usercode })
                const discount = code[0].discount
                res.send({ success: discount })
            } else {
                await coupenData.findOneAndDelete({ code: usercode })
                req.flash('error', 'Invalid code')
                res.redirect('back')
            }
        } else {
            req.flash('error', 'Invalid code')
            res.redirect('back')
        }
    } catch (err) {
        res.render('error',{err})
    }
}

module.exports = {
    coupens,
    addCoupen,
    applyCoupen,
    saveCoupen,
    deleteCoupen
}