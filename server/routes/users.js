// server routes for interacting with users in the database
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { hashPassword, checkPassword, generateToken } = require('../lib/passwordUtils');
const logDatabaseOperation = require('../lib/logOperations');

// should return all users from the database
router.get('/', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.json({message: 'Error finding users', errMsg: err.message, err});
        } else {
            res.json(users);
        }
    })
});

// Should return a user with the given id
router.get('/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            res.json({
                message: 'User not found',
                errMsg: err.message,
                err
            });
        } else {
            res.json(user);
        }
    })
});

// Should create a new user and return the new user
router.post('/', (req, res) => {
    try{
    // validation requires name, email, and password
    const user  = new User(req.body.user)
    // Password Should be passed though hashing function before being saved
    user.password = hashPassword(user.password);
    // save the user
    user.save((err, user) => {
        if (err) {
            logDatabaseOperation("Create New User", "User", user)
            res.json({
                message: "error creating user",
                errMsg: err.message,
                err
            });
        } else {
            res.json(user);
        }
    })
    } catch(err) {
        res.json({
            message: "error creating user",
            errMsg: err.message,
            err
        });
    }
});

// Should update a user with the given id and return the updated user
router.put('/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            res.json({ message: 'User not found', errMsg: err.message, err });
        } else {
            // update the user
            user.name = req.body.name;
            user.email = req.body.email;
            user.password = hashPassword(req.body.password);
            user.admin = req.body.admin;
            // save the user
            user.save((err, user) => {
                if (err) {
                    logDatabaseOperation("Edit Existing User", "User", user)
                    res.json({message: "error updating user", errMsg: err.message, err});
                } else {
                    res.json(user);
                }
            })
        }
    })
});

// Should delete a user with the given id and return the deleted user
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id, (err, user) => {
        if (err) {
            logDatabaseOperation("Delete User", "User", user)
            res.json({ message: 'User not found', errMsg: err.message, err });
        } else {
            res.json(user);
        }
    })
});


// Should be able to login with a user's email and password
// this route will generate a token for the user wich should be caches in the browser
router.post('/login', (req, res) => {
    const { email, password } = req.body.user;
    User.findOne({"email": email}, (err, user) => {
        try{
        if (err) {
            res.status(403).json({ message: 'User not found', errMsg: err.message, err });
        } else {
            if (checkPassword(password, user.password)) {
                // respond with user info and a token
                const token = generateToken(user);
                // save the token to the user
                user.token = token;
                user.save((err, user) => {
                    if (err) {
                        logDatabaseOperation("Generate User Token", "User", user)
                        res.json({ message: 'Error saving token', errMsg: err.message, err });
                    } else {
                        // respond with user info and a token
                        res.json({ "id": user._id, user, token });
                    }   
                })      
            } else {
                // user failed login
                res.json({ message: 'Incorrect password' });
            }
        }
        } catch(err) {
            res.status(501).json({ message: 'Error logging in', errMsg: err.message, err });
        }
    })
});

// logout the user by removing the token from the user
// this should make the user unable to access protected routes
router.post('/logout', (req, res) => {
    const { id } = req.body.user;
    User.findOne({_id: id}, (err, user) => {
        if (err) {
            res.status(401).json({ message: 'User not found', errMsg: err.message, err });
        } else {
            // remove the token from the user
            user.token = '';
            user.save((err, user) => {
                if (err) {
                    res.status(501).json({ message: 'Error altering token', errMsg: err.message, err });
                } else {
                    logDatabaseOperation("Remove User Token", "User", user)
                    res.json({ message: 'Logged out' });
                }
            })
        }
    })
});

module.exports = router;