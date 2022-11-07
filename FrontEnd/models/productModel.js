const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true
    },
    images: [{
        url: String,
        filename: String
    }],
    highlights: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    expiresAt: Date,
    deleted: false
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)