// megan logger

const colors = require('colors');

function colorifier(req, str) {
    switch (req.method) {
        case 'GET':
            return str.green;
        case 'POST':
            // if there is a body, log its contents
            if (req.body) {
                return(str.yellow + '\n' +  "Data Recieved: " + JSON.stringify(req.body, null, 2) )
            } else {
                return str.yellow;
            }
        case 'PUT':
            return str.cyan;
        case 'DELETE':
            return str.red;
        default:
            return str;
    }
}


module.exports = function logger (req, res ,next) {
    console.log(colorifier(req, `**Traffic: ${req.method.toUpperCase()} ${req.originalUrl}` ));
    next();
}