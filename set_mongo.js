var MongodbClient = require('mongodb').MongoClient;
var dbInfo = require('./dbInfo.json');

function connect() {
  return new Promise(function(resolve, reject) {
    MongodbClient.connect(`mongodb://${dbInfo.common.host}:${dbInfo.common.port}`, 
      function(err, client) {
        if(err){
          reject(err);
        } else {
          resolve(client);
        }
    })
  })
}

function createUser(db, info) {
  return new Promise(function(resolve, reject) {
    db.addUser(
      info.username,
      info.password,
      {roles : [
        { role : "dbAdmin", db : info.database },
        { role : "readWrite", db : info.database }
      ]}, function(err, result) {
        if(err) {
          if(err.code === 11000 || err.code === 51003) { 
            console.log(`${info.database} already exist`);
            resolve(); 
          }
          else { reject(err); }
        } else {
          console.log(`create ${info.database} user`);
          resolve();
        }
      }
    )
  })
}

function run() {

  var client;
  return connect()
    .then(function(_client) {
      client = _client;
      var promises = Object.keys(dbInfo.DBs).map(function(key) {
        var info = dbInfo.DBs[key];
        var db = client.db(info.database);

        if(!db) {
          throw new Error("Could't find database");
        }
        return createUser(db, info);
      })
      return Promise.all(promises);
    })
    .then(function(){
      console.log("Mongodb : Setting > All database has done setting Successfully");
    })
    .catch(function(err){
      console.error(err);
    })
    .finally(function(){
      client.close();
    })
}

module.exports = run;