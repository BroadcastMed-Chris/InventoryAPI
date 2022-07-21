// verify user exists and is Logged in to access a route
const User = require('../models/user');


async function requireLogin (req, res, next) {
    if(req.cookies['token']){
        const user = await User.findOne({'token': req.cookies.token})
        if(user !== null && user.token === req.cookies.token){
            next()
        } else {
            res.status(401).json({message: "You must be logged in"})
        }
    } else {
        res.status(401).json({message: "You must be logged in"})
    }

}

// verify the user is logged in and has admin rights to access a route

async function requireAdmin (req, res, next) {
    if(req.cookies['token']){
        const user = await User.findOne({'token': req.cookies.token})
        if(user !== null && user.token === req.cookies.token && user.admin){
            next()
        } else {
            res.status(401).json({message: "You do not have privledges, contact Administrator."})
        }
    } else {
        res.status(401).json({message: "You must be logged in"})
    }
}

module.exports = {requireLogin, requireAdmin}