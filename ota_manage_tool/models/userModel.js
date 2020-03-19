var mongoose = require('mongoose')
var UserSchema = new mongoose.Schema({
    email : { type : String, unique : true},
    // password : { type : String, required : true},
    // salt : { type : String, required : true },
    name : { type : String, required : true },
    lastAccess : { type : Date, default : Date.now()},
    admin : {type : Boolean, default : false},
    // aeid : {type : String, required : true }
})

const UserModel = mongoose.model('User', UserSchema);

UserModel.find({admin : true}).exec()
.then((result) => {
  if(!result.length > 0){
    new UserModel({
      email : "otaAdmin@keti.re.kr",
      password : "DaFhUtAh3oj//2L8IZHKRoktVmx3xHE/G+wZc+R6tfW/bcM5iWvOaqOcu9/ULnQqwwkguDNJeSufFfJODCapXw==",
      salt : "P5KVd/R+echhrGC1D60SFyjMuKTiSV3qyGvrNJSsv1pEPK3tqYjMNVw4xGfSyyWR/wswKd4q6Aajz7lBIEzSZw==",
      name : "admin",
      admin : true,
      aeid : "null",
    }).save();
  }
})
.catch((err) => {
  console.error("could not load administrator");
})

module.exports = UserModel;