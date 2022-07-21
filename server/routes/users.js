// server routes for interacting with users in the database
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { hashPassword, checkPassword, generateToken } = require('../lib/passwordUtils');
const logDatabaseOperation = require('../lib/logOperations');
const {requireLogin, requireAdmin} = require('../lib/routeProtection');

// should return all users from the database
router.get('/', requireAdmin, (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.json({message: 'Error finding users', errMsg: err.message, err});
        } else {
            res.json(users);
        }
    })
});

// Should return a user with the given id
router.get('/:id', requireAdmin, (req, res) => {
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
router.post('/', requireAdmin, (req, res) => {
    try{
    // validation requires name, email, and password
    const user  = new User(req.body.user)
    // Password Should be passed though hashing function before being saved
    user.password = hashPassword(user.password);
    // save the user
    user.save((err, user) => {
        if (err) {
            logDatabaseOperation("Error: Creating New User", "User", user)
            res.json({
                message: "error creating user",
                errMsg: err.message,
                err
            });
        } else {
            logDatabaseOperation("Create New User", "User", user)
            res.status(201).json({message: 'User Created', user});
        }
    })
    } catch(err) {
        logDatabaseOperation(`Error: Create User Failed, ${err.message}`, "User", err)
        res.json({
            message: "error creating user",
            errMsg: err.message,
            err
        });
    }
});

// Should update a user with the given id and return the updated user
router.put('/:id', requireAdmin, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            logDatabaseOperation("Error: User to edit not found or missing fields", "User", user)
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
                    logDatabaseOperation("Error: Edit Existing User", "User", user)
                    res.json({message: "error updating user", errMsg: err.message, err});
                } else {
                    logDatabaseOperation("Edit Existing User", "User", user)
                    res.json({displayName: user.name, id: user._id, email: user.email, isAdmin: user.admin});
                }
            })
        }
    })
});

// Should delete a user with the given id and return the deleted user
router.delete('/:id', requireAdmin, (req, res) => {
    User.findByIdAndRemove(req.params.id, (err, user) => {
        if (err) {
            logDatabaseOperation("Error: Delete User Failed", "User", user, err)
            res.json({ message: 'User not found', errMsg: err.message, err });
        } else {
            logDatabaseOperation("Delete User Succeed", "User", user)
            const info = {
                displayName: user.displayName,
                email: user.email,
                admin: user.admin
            }
            res.json({message: `Success: ${user.displayName} deleted`, info});
        }
    })
});


// Should be able to login with a user's email and password
// this route will generate a token for the user wich should be caches in the browser
router.post('/login', (req, res) => {
    const { email, password } = req.body.user;
    User.findOne({"email": email}, async (err, user) => {
        try{
            if(user === null){
                logDatabaseOperation(`Error: Failed user lookup - Could not be found`, "User", req.body.user)
                res.status(401).json({message: "That user does not exits"});
            }
            if (err) {
                logDatabaseOperation(`Error: ${err.message}`, "User", user)
                res.status(401).json({ message: 'User not found', errMsg: err.message, err });
            } else {
                if (checkPassword(password, user.password)) {
                    if(!user.token){
                        // respond with user info and a token
                        const token = generateToken(user);
                        // save the token to the user
                        user.token = token;
                        await user.save((err, user) => {
                            if (err) {
                                logDatabaseOperation("Generate User Token", "User", user)
                                res.status(500).json({ message: 'Error saving token', errMsg: err.message, err });
                            } else {
                                // set session cookie and user properties for the client
                                res.cookie('token', token)
                                // respond with user info and a token
                                res.json({ message: `Welcome ${user.displayName}`, user });
                            }   
                        })
                    } else {
                        res.cookie('token', user.token);
                        res.json({message: "You are already logged in", user})
                    }     
                } else {
                    // user failed login
                    res.status(401).json({ message: 'Incorrect password' });
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
    const { email } = req.body.user;
    User.findOne({email: email}, (err, user) => {
        if (err) {
            res.status(401).json({ message: 'User not found', errMsg: err.message, err });
        } else {
            if(user.token){
                // remove the token from the user
                user.token = null;
                user.save((err, user) => {
                    if (err) {
                        res.status(501).json({ message: 'Error altering token', errMsg: err.message, err });
                    } else {
                        logDatabaseOperation("Remove User Token", "User", user)
                        // remove the session cookies
                        res.session = null
                        res.json({ message: 'Logged out, goodbye' });
                    }
                })
            } else {
                res.json({message: "You are not currently logged in"})
            }
        }
    })
});

module.exports = router;