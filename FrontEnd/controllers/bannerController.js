const bannerData = require('../models/bannerModel')



const setBanner = async (req, res) => {
    try {
        const banners = await bannerData.find({})
        res.render('admin/banners', { banners })
    } catch (err) {
        res.render('error',{err})
    }
}

const addBanner = async (req, res) => {
    try {
        res.render('admin/addBanner')
    } catch (err) {
        res.render('error',{err})
    }
}

const saveBanner = async (req, res) => {
    try {
        const banner = new bannerData({
            highlight: req.body.highlight,
            description: req.body.description,
            date: Date.now()

        })
        banner.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
        await banner.save()
        req.flash("success", 'Banner added successfully')
        res.redirect('back')
    } catch (err) {
        res.render('error',{err})
    }
}

module.exports = {
    setBanner,
    addBanner,
    saveBanner
}