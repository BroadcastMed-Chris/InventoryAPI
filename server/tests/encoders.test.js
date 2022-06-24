const mongoose = require('mongoose');
const Encoder = require('../models/encoder.js');
const request = require('supertest');
const router = require('../routes/encoders.js');

describe('Encoder Entity Tests', function() {

    // // reset the database after each test
    // afterEach( async function (done) {
    //     // connect to mongoose database
    //     const mongooseURI = process.env.MONGODB_URI || 'mongodb://docker:mongopw@localhost:49153/test';
    //     mongoose.connect(mongooseURI);
    //     await Encoder.deleteMany({});
    //     done();
    // })
    
    it('Should be able to list all encoders', async function (done) {
        try {
            const res = await request(router).get('/encoders');
            console.log(res)
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(0);
            done();
        } catch (err) {
            done(err);
        }
    });
    

})