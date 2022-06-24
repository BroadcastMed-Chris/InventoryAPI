// mongoose model for users
const mongoose = require('mongoose');

mongoose.model('User', {
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // this should be hashed
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    token:{
        type: String,
        required: false
    }
});

module.exports = mongoose.model('User');