/**
 */
"use strict";

var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose');
var shortid = require('shortid');
var bcrypt = require('bcrypt-nodejs');
var uuidv4 = require('uuid/v4');

var Schema = mongoose.Schema;

var UsersSchema = new Schema({


  userid: {
    type: String,
    unique: true,
    default: shortid.generate
  },


  username: {
    type: String
  },


  email: {
    type: String
  },


  password: {
    type: String
  },

  lastLoginTime: {
    type: Date,
    default: null
  },

  resetPassordInfo: {
    type: Schema.Types.Mixed
  },

  registerType : {
    type : String
  }
});


UsersSchema.plugin(timestamps);



UsersSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UsersSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};



UsersSchema.methods.updateLastLogin = function() {
  this['lastLoginTime'] = new Date();
  return this.save();
};


UsersSchema.methods.updatePasswordResetInfo = function() {
  this['resetPassordInfo'] = {
    "timestamp": new Date(),
    "token": uuidv4()
  }

  return this.save();
};


UsersSchema.methods.updatePassword = function(password) {
  this['password'] = this.generateHash(password);
  this['resetPassordInfo'] = null;
  return this.save();
};


module.exports = mongoose.model('users', UsersSchema);
