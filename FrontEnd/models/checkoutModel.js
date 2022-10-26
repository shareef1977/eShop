const mongoose = require('mongoose')

const checkoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
       
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product'
       
       
    },
    address: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: String,
            required: true,
            trim: true
        },
        addressLine: {
            type: String,
            required: true,
            trim: true
    
    
        }
    },
    paymentStatus: {
        type: String,
        enum: ["cod","online"],
        required: true
    },
    bill: {
        type: Number,
        required: true
    },
    orderStatus: [{
        type: {
            type: String,
            enum: ["Ordered","Packed","Shipped","Delivered","Cancelled"],
            default: "Ordered"
        },
        date: {
            type: Date
        },
        isCompleted: {
            type: Boolean,
            default: false
        } 
    }],
    expectedDate: {
        type: Date,
        default: () => new Date( + new Date() + 7 * 24 * 60 * 1000)
    }
},{timestamps: true})


module.exports =mongoose.model("Checkout",checkoutSchema)