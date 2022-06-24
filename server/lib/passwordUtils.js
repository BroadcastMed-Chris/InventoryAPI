const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// this file contains functions to generate and check passwords


// has the user password and return the hashed password
function hashPassword (str) {
    console.log(str)
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(str, salt);
}

// check the if the password is correct or not and return true or false
function checkPassword (str, hash) {
    return bcrypt.compareSync(str, hash);
}

// generate a cookie for the user
function generateToken (user) {
    // convert the user from object to JSON
    user = user.toJSON();
    // create a cookie with the user id and the secret
    return jwt.sign(user, process.env.SECRET || "LoginGoBRRRRR");
}

// middleware - check if user has valid token and is logged in
// 
function checkToken (req, res, next) {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, process.env.SECRET || "LoginGoBRRRRR", (err, decoded) => {
            if (err) {
                res.json({ message: 'Invalid token', errMsg: err.message, err });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // send a 401 error if there is no token
        res.status(401).json({ message: 'No token provided' });
    }
}


module.exports = {
                    hashPassword,
                    checkPassword,
                    generateToken,
                    checkToken
                };