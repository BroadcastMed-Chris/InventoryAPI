const request = require('supertest')
const app = require('../server');
const config = require('../../testConfig.js');
const { JsonWebTokenError } = require('jsonwebtoken');

describe('API end-to-end Tests', function() {
   
    // inital root user
    const rootUser = config;

    // simulates saving the cookie in the browser
    let cookieStore = null
    let standardUser = null

    it("Should send a cookie to be saved even when we are not logged in", (done) => {
        request(app)
            .get('/encoders')
            .expect('set-cookie', 'token=j%3Anull; Path=/', done);
    })
    
    it('Should be rejected at /encoders without authorization', (done) => {
        // this should be just base level user access
        request(app)
            .get('/encoders')
            .expect(401)
            .expect(res => {
                res.body.message = "You must be logged in"
            })
            done()
    })

    it('Should be rejected at /encoders/:id without authorization', (done) => {
        // this should be just base level user access

        const validId = "62a796b2b34fa199993d6915"

        request(app)
            .get('/encoders/${validId}')
            .expect(401)
            .expect(res => {
                res.body.message = "You must be logged in"
            })
            done()
    })

    it('Should be rejected at /encoders/:id without authorization', (done) => {
        // this route requires admin

        const data = {
            "name": "test",
            "encoderType": "test",
            "status": "in",
        }

        request(app)
            .post('/encodes')
            .send(data)
            .expect(401)
            .expect(res => {
                res.body.message = "You must be logged in"
            })
            done()
    })

    it('Should be rejected at /encoders/:id without authorization', (done) => {
        // this route requires admin

        const data = {
            "name": "something different",
            "encoderType": "test",
            "status": "in",
        }

        request(app)
            .put('/encodes')
            .send(data)
            .expect(401)
            .expect(res => {
                res.body.message = "You must be logged in"
            })
            done()
    })

    
    it('Should Update the cookie when we successfuly log in', (done) => {
        const data = {
            user: {
                email: "test@test.com",
                password: "1234"
            }
        }

        request(app)
            .post('/users/login')
            .send(data)
            .expect(200)
            .expect(res => {
                const t = res.body.user.token;
                // simulate saving the cookie in the browser
                cookieStore = t;
                expect('set-cookie', `token=${cookieStore}; Path=/`)
                // simulate saving the user info to storage 
                user = res.body.user
            }) 
            done()
    })

    it('Should accept request to /encoders with with authorization', (done) => {

        request(app)
            .get('/encoders')
            .set('Cookie', cookieStore)
            .send()
            .expect(200)
            .expect(res => {
               expect(Array.isArray(res.body))
            })
            done();
    })

    it('Should be able to access /users with admin credentials', (done) => {
        request(app)
            // request my own root account's id
            .get(`/users/${rootUser.id}`)
            .set('Cookie', cookieStore)
            .send()
            .expect(200)
            .expect(res => {
                expect(res.body.displayName === rootUser.name)
            })
            done();
    })

    it('Should be able to create a new user', (done) => {
        const data = {
            user: {
                displayName: 'standardUser',
                email: 'standard@test.com',
                password: '0000',
                admin: false
            }
        }

        // create a new user
        request(app)
            .post('/users')
            .set('Cookie', cookieStore)
            .send(data)
            .expect(201)
            .expect(res => {
                expect(res.body.message === 'User Created')
                standardUser = res.body
            })
            done()
    })



})