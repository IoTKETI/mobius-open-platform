var mongoose = require('mongoose');
var path = require('path');

mongoose.Promise = global.Promise;

var mongoConnector = {};
const dbInfo = CONFIG.mongo;

const url = `mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`;

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
        user : dbInfo.user,
        pass : dbInfo.password,
        useNewUrlParser : true
    });
}

mongoConnector.disconnect = () => {
    return mongoose.disconnect();
}

mongoConnector.connectMiddleware = function(req, res, next){
    try{
        this.connect()
        .then(()=> {
            console.log('Successfully Connected Database');
            next();
        })
        .catch( err => {
            throw err;
        });
    }catch(err){
        mongoose.disconnect()
        .catch(err => {
            next(err);
        })
    }
}
module.exports = mongoConnector;