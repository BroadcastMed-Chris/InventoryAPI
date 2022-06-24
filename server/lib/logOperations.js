// this library contains the functions to log database operations
const fs = require('fs');

// this function should be called on all functions that write or alto the database
function logDatabaseOperation (operation, collection, data) {
    // write to a log file located in the server/logs folder
    // the log file should have the following format:
    // operation: operation name
    // collection: collection name
    // data: data that was written to the database
    // timestamp: time the operation was performed
    // ip: ip address of the user that performed the operation
    // user: user that performed the operation
    
    // example log entry:
    // {
    //     operation: 'create',
    //     collection: 'users',
    //     data: {
    //         name: 'John Doe',
    //         email: '
    //         password: '
    //     },

    //     timestamp: '2018-01-01T00:00:00.000Z',
    //     ip: '
    //     user: '
    // }

    // create a log entry
    const logEntry = {
        operation: operation,
        collection: collection,
        data: data,
        // format the timestamp to be in the format: 2018-01-01T00:00:00.000Z
        timestamp: new Date().toISOString()
        }
    
    try{
        // write the log entry to the log file
        fs.appendFileSync('./server/logs/databaseLog.json', JSON.stringify(logEntry) + '\n');
    } catch(err) {
        // just in cast there is an error writing to the log file
        console.log(err);
    }
}

module.exports = logDatabaseOperation