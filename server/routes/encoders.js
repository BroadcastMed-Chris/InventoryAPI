// server routes for interacting with encoders in the database
const express = require('express');
const router = express.Router();
const Encoder = require('../models/encoder');
const logDatabaseOperation = require('../lib/logOperations');

// should return all encoders from the database
router.get('/', (req, res) => {
    Encoder.find({}, (err, encoders) => {
        if (err) {
            res.send(err);
        } else {
            res.json(encoders);
        }
    })
});

// should return a single encoder from the database
router.get('/:id', (req, res) => {
    Encoder.findById(req.params.id, (err, encoder) => {
        if (err) {
            res.send(err);
        } else {
            res.json(encoder);
        }
    })
});

// should create a new encoder in the database
router.post('/', (req, res) => {
    Encoder.create(req.body, (err, encoder) => {
        if (err) {
            res.send(err);
        } else {
            logDatabaseOperation("Create a new Encoder", "Encoders", encoder)
            res.json({message:'Success' ,encoder});
        }
    })
});

// should update an existing encoder in the database
router.put('/:id', (req, res) => {
    Encoder.findByIdAndUpdate(req.params.id, req.body, (err, encoder) => {
        if (err) {
            res.send(err);
        } else {
            logDatabaseOperation("Edit Existing Encoder", "Encoders", encoder)
            res.json({message:'Updated Successfully' ,encoder});
        }
    })
})

// Should be able to delete an encoder from the database
router.delete('/:id', (req, res) => {
    Encoder.findByIdAndRemove(req.params.id, (err, encoder) => {
        if (err) {
            res.send(err);
        } else {
            logDatabaseOperation("Delete Encoder", "Encoders", encoder)
            res.json({message:'Deleted Successfully' ,encoder});
        }
    })
})


// QR code route for toggling the status of an encoder between in and out
router.put('/:id/toggle', (req, res) => {
    Encoder.findById(req.params.id, (err, encoder) => {
        if (err) {
            res.send(err);
        } else {
            if (encoder.status === 'in') {
                encoder.status = 'out';
            } else {
                encoder.status = 'in';
            }
            encoder.save((err, encoder) => {
                if (err) {
                    res.send(err);
                } else {
                    logDatabaseOperation("Toggle Encoder Status", "Encoders", encoder)
                    res.json({message:'Toggled Successfully' ,encoder});
                }
            })
        }
    })
})

module.exports = router;