const sessionCheck = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    } else {
        next()
    }
}

const sessionCheckHomePage = (req, res, next) => {
    if (req.session.user) {
        next();
    }
    else {
        res.redirect('/loginPage')
        next()
    }
}

const adminSessionCheck = (req, res, next) => {
    if (req.session.admin) {
        res.redirect('/adminHome')
    } else {
        next()
    }
}

const adminSessionCheckHomePage = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/adminLogin')
        next()
    }
}

module.exports = {
    sessionCheck,
    sessionCheckHomePage,
    adminSessionCheck,
    adminSessionCheckHomePage
} 