const mongoose = require('mongoose')

const Schema = mongoose.Schema
const brandSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    deleteStatus: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Brand', brandSchema)
