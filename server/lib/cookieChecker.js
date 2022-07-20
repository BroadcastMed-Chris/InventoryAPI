// if there is no cookie create a blank one

// if a session cookie is recieved assign it to req.session

module.exports = function cookieChecker (req, res, next) {
    if(!req.cookies['token']){
        res.cookie('token', null)
    }
    next()
}