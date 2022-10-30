const mongoose = require('mongoose')

const cartSchema = mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    cartItems:[
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true
            },price: Number
        }
    ],
    
    
})


module.exports = mongoose.model('CartItem', cartSchema)