const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// connect to mongoose database
const mongoose = require('mongoose');

let mongooseURI = ""

// if environment is production, use the production database
if (process.env.NODE_ENV === 'PROD') {
    mongooseURI = process.env.MONGODB_URI;
// if environment is not production, use the local database
} else {
    mongooseURI = 'mongodb://docker:mongopw@localhost:49153';
}

const port = process.env.PORT || 3000;

mongoose.connect(mongooseURI);
// log a success message on connection
mongoose.connection.on('connected', () => {
    console.log('Database is connected'.rainbow);
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