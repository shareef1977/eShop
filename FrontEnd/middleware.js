





const sessionCheck = (req,res,next) => {
    if(req.session.user){
        res.redirect('/')

    } else {
        next()
    }
}

const sessionCheckHomePage = (req,res,next) => {
    if(req.session.user) {
       next();
            
    }else {
       res.redirect('/loginPage')
    next()
    }
}



 module.exports = {
    sessionCheck,
    sessionCheckHomePage,
    
 } 