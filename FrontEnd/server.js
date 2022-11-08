require('dotenv').config()

const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const methodOverride = require('method-override')

const app = express()

const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')
const productRouter = require('./routes/productRouter')
const categoryRouter = require('./routes/categoryRouter')
const cartRouter = require('./routes/cartRouter')
const wishlistRouter = require('./routes/wishlistRouter')
const checkoutRouter = require('./routes/checkoutRouter')
const bannerRouter = require('./routes/bannerRouter')
const coupenRouter = require('./routes/coupenRouter')

app.set('view engine', 'ejs')
app.set(express.static(path.join(__dirname, '/views')))

app.use(flash())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const store = new MongoDBStore({
    uri: process.env.MONG_URI,
    collection: 'sessionValues'
})
store.on('error', function (error) {
    console.log(error)
})
app.use(cookieParser())
app.use(session({
    key: "user_sid",
    secret: process.env.SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
}))

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.user = req.session.user
    res.locals.admin = req.session.admin
    next();
})

app.use('/css', express.static(path.join(__dirname, "assets/css")))
app.use('/img', express.static(path.join(__dirname, "assets/img")))
app.use('/js', express.static(path.join(__dirname, "assets/js")))

app.use('/', userRouter)
app.use('/', adminRouter)
app.use('/', productRouter)
app.use('/', categoryRouter)
app.use('/', cartRouter)
app.use('/', wishlistRouter)
app.use('/', checkoutRouter)
app.use('/', bannerRouter)
app.use('/', coupenRouter)

app.use((req, res, next) => {
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
})

mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Listening to port 7000!!!')
        })
    })
    .catch((err) => {
        console.log(err)

    })