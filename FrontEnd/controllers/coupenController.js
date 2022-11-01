const coupenData = require('../models/coupenModel')
const cartData = require('../models/cartModel')

const coupens = async(req,res) => {
    try{
        const coupens = await coupenData.find({})
        res.render('admin/coupens',{coupens})
    } catch(err) {
        console.log(err)
    }
}

const addCoupen = async(req,res) => {
    try{
        res.render('admin/addCoupen')
    } catch(err) {
        console.log(err)
    }
}

const saveCoupen = async(req,res) => {
    try {
        const coupen = new coupenData ({
            code: req.body.code,
            discount: req.body.discount
        })
        await coupen.save()
        req.flash('success','Coupen added successfully')
        res.redirect('/addCoupen')
    } catch(err) {
        console.log(err)
    }
}

const deleteCoupen = async(req,res) => {
    try{
        const {id} = req.params
        console.log(id)
        await coupenData.findByIdAndDelete(id)
        res.redirect('/coupens')
    } catch(err) {
        console.log(err)
    }
}


const applyCoupen = async(req,res) => {
   try{
        const usercode = req.params.id
        console.log(req.params)
        const code = await coupenData.find({code: usercode})
        


        // console.log(code[0].discount)
        
        if(code){
            const userId = req.session.user._id
            await cartData.findOneAndUpdate({userId},{coupenCode:usercode})
            const discount = code[0].discount    
            res.send({success:discount})
        } else {
            req.flash('error','Invalid code')
            res.redirect('back')
        }
   } catch(err) {
        console.log(err)
   }
}


module.exports = {
    coupens,
    addCoupen,
    applyCoupen,
    saveCoupen,
    deleteCoupen
}