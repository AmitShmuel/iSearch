//--------------------------------Connect to mongodb on mLab via Mongoose--------------------------------//
const keys = require('./keys'),
      mongoose = require('mongoose');


mongoose.Promise = global.Promise;

//The server option auto_reconnect is defaulted to true
//const options = {
//    server: {
//        auto_reconnect:true,
//    }
//};
mongoose.connect(keys.MLAB_KEY);

const conn = mongoose.connection;//get default connection

// Event handlers for Mongoose
conn.on('error', (err) => console.log('Mongoose: Error: ' + err));

conn.on('open', () => console.log('Mongoose: Connection established'));

conn.on('disconnected', () => {
    console.log('Mongoose: Connection stopped, recconect');
    mongoose.connect(keys.MLAB_KEY, options);
});

conn.on('reconnected', () => console.info('Mongoose reconnected!'));