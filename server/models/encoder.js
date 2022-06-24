const mongoose = require('mongoose');

// mongoose model for encoders

mongoose.model('Encoder', {
    name: {
        type: String,
        required: true,
        unique: true
    },
    notes: String,
    type: {
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['in', 'out'],
    },
    Show: String,
    encoderTypeId: String,
    encoderId: String,
});

module.exports = mongoose.model('Encoder');