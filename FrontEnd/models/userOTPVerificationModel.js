const mongoose = require('mongoose')

const otpSchema = mongoose.Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date
})

module.exports = mongoose.model('UserOTPVerification', otpSchema)