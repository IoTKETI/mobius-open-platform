var tokenModel = require('../models/model.token');
var userModel = require('../models/model.users');

module.exports.addRefreshToken = function(owner, refreshToken){
  return new tokenModel({
    owner : owner,
    refreshToken : refreshToken
  }).save();
}
module.exports.findTokenExist = function(email, refreshToken){

  return userModel.findOne({email : email}).exec()
    .then(user => {
      if(!user){
        throw new Error("Could not find matched user");
      }
      return tokenModel.findOne({
        owner : user,
        refreshToken : refreshToken
      }).exec();
    }) 
}
module.exports.removeRefreshToken = function(owner){
  return tokenModel.findOneAndRemove({
    owner : owner
  }).exec();
}