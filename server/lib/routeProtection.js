// verify user exists and is Logged in to access a route
const User = require('../models/user');


async function requireLogin (req, res, next) {
    const {token} = req.headers
    console.log(token)
    if(token !== undefined || token !== null){
        const user = await User.findOne({'token': token})
        if(user !== null && user.token === token){
            next()
        } else {
            res.status(401).json({message: "You must be logged in", err: "token invalid"})
        }
    } else {
        res.status(401).json({message: "You must be logged in"})
    }

}

// verify the user is logged in and has admin rights to access a route

async function requireAdmin (req, res, next) {
    const {token} = req.headers
    console.log(token)
    if(token !== undefined || token !== null){
        const user = await User.findOne({'token': token})
        if(user !== null && user.token === token && user.admin){
            next()
        } else {
            res.status(401).json({message: "You must be logged in", err: "token invalid"})
        }
    } else {
        res.status(401).json({message: "You must be logged in"})
    }
}

module.exports = {requireLogin, requireAdmin}