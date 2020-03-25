const mongoose    = require('mongoose');
const timestamps  = require('mongoose-timestamp');
const crypto      = require('crypto');
const ms          = require('ms');
const randtoken   = require('rand-token');
const _           = require('lodash');

const SECURITY_CONFIG = global.CONFIG.security;
const DEFAULT_EXPIRE_IN = '8w';

const Schema = mongoose.Schema;


const UserModel = new Schema({
  userName: String,
  userId: String,
  email: String,
  aeresourceid: String,
  password: String,
  language: {
    type: String,
    enum: ['de', 'us'],
    default: 'de'
  },
  refreshTokens: Schema.Types.Mixed,
  role: {
    type: String,
    enum: ['rootadmin', 'admin', 'user', 'family'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['READY-TO-ACTIVE', 'ACTIVE', 'TO-BE-DELETED'],
    default: 'READY-TO-ACTIVE'
  }
})

// create new User document
UserModel.statics.create = function(signinInfo) {
  const encrypted = crypto.createHmac('sha256', SECURITY_CONFIG.authSecret)
    .update(signinInfo.password)
    .digest('base64');

  var userInfo = _.pick(signinInfo, ['userName', 'email', 'userId']);
  userInfo['password'] = encrypted;


  var user = new this(userInfo);

  // return the Promise
  return user.save()
};

// check user already exists
UserModel.statics.checkUserExists = function(userId, email) {
  return this.findOne({
    $or: [ { userId: userId }, { email: email }]
  }).exec();
};


// find one user by using userId
UserModel.statics.findOneByUserId = function(userId) {
  return this.findOne({
    userId: userId,
    status: { $in: ['READY-TO-ACTIVE', 'ACTIVE'] }
  }).exec();
};


// find one user by using userId
UserModel.statics.findAll = function() {
  return this.find().exec();
};


// verify the password of the User documment
UserModel.methods.verify = function(password) {
  const encrypted = crypto.createHmac('sha256', SECURITY_CONFIG.authSecret)
    .update(password)
    .digest('base64');

  return this.password === encrypted
};


UserModel.methods.assignAdmin = function() {
  this.admin = true;
  return this.save()
};

UserModel.methods.resetRefreshToken = function(type) {
  if(this.refreshToken && this.refreshToken[type])
    delete this.refreshTokens[type];
  return this.save();
};

UserModel.methods.getRefreshToken = function(type) {
  if(this.refreshToken && this.refreshToken[type])
    return this.refreshTokens[type];
  else
    return null;
};

UserModel.methods.createRefreshToken = function(type) {
  var refreshToken = randtoken.uid(128);

  var expIn = DEFAULT_EXPIRE_IN;
  if(SECURITY_CONFIG.expiresIn && SECURITY_CONFIG.expiresIn[type] && SECURITY_CONFIG.expiresIn[type]['refresh'])
    expIn = SECURITY_CONFIG.expiresIn[type]['refresh'];

  var expireAt = new Date() + ms(expIn);

  if(!this.refreshTokens)
    this.refreshTokens = {};

  this.refreshTokens[type] = {
    expiredAt: expireAt,
    token: refreshToken
  };

  return this.save();
};

UserModel.plugin(timestamps);

module.exports = mongoose.model('User', UserModel);
