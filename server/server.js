const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const cookieChecker = require('./lib/cookieChecker')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
dotenv.config();

// connect to mongoose database
const mongoose = require('mongoose');

let mongooseURI = ""


// if environment is production, use the production database
if (process.env.NODE_ENV === 'PROD') {
    mongooseURI = process.env.MONGO_URI;
// if environment is not production, use the local database
} else {
    mongooseURI = process.env.MONGO_DEV_URI;
}

const port = process.env.PORT || 3000;

mongoose.connect(mongooseURI);
// log a success message on connection
mongoose.connection.on('connected', () => {
    if(process.env.NODE_ENV === 'PROD'){
        console.log('Database is connected'.rainbow);
    }
});
// throw an error if there is a problem connecting to the database
mongoose.connection.on('error', (err) => {
    console.log(err);
    }
);

const app = express();

// logger
app.use(cors());
app.use(express.json());
const logger = require('./lib/megan');
app.use('*', logger);
app.use(cookieParser())

// authentication sessions
app.use(cookieSession({
    name: 'session',
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000 
}))

app.use( cookieChecker )

// sanity checking route
app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

// routers
const encoderRouter = require('./routes/encoders');
const userRouter = require('./routes/users');

app.use('/encoders', encoderRouter);
app.use('/users', userRouter);

app.listen(port, () => {
    console.log(`Inventory API listening on port ${port}`);
});


module.exports = app;