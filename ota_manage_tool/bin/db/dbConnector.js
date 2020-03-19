var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');

mongoose.Promise = global.Promise;

var mongoConnector = {};

const url = `mongodb://${CONFIG.mongo.host}:${CONFIG.mongo.port}/${CONFIG.mongo.database}`;

mongoConnector.connected = (db) => {
    console.log('Sucessfully Connected!');
}

mongoConnector.alterResult = (err,db) => {
    if(err){
        console.error('Connector has error while connect to DB');
        mongoose.disconnect()
        return;
    }
    mongoConnector.connected(db);
}

mongoConnector.connect = () => {
    console.log(url);
    return mongoose.connect(url, {
        useNewUrlParser : true,
        user : CONFIG.mongo.user,
        pass : CONFIG.mongo.password
    }, (err) => {
        console.error(err);
    });
}

module.exports = mongoConnector;