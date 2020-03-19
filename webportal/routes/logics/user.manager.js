/**
 * Created by kimtaehyun on 2017. 12. 01.
 */

'use strict';

var debug = require('debug')('keti');

var UsersModel = require('../models/model.users.js');
var AcpsModel = require('../models/model.acps.js');
var onem2mManager = require('./onem2m.manager.js');
var uuidv4 = require('uuid/v4');
var nodemailer = require('nodemailer');



function _findUserByEmail(email) {

  return new Promise( function(resolve, reject) {
    try {

      UsersModel.findOne({email: email}).exec()

      .then(function(user){
        resolve(user);
      })

      .catch(function(err){
        debug(err);
        reject(err);
      });
    }
    catch( err ) {
      debug(err);
      reject( err );
    }
  });
}

function _findUsersByEmail(emailArray) {

  return new Promise( function(resolve, reject) {
    try {
      if(!Array.isArray(emailArray)) {
        emailArray = [emailArray];
      }

      UsersModel.find({ "email": { $in: emailArray } }, {"email": 1, "username": 1}).exec()

      .then(function(users){
        resolve(users);
      })

      .catch(function(err){
        debug(err);
        reject(err);
      });
    }
    catch( err ) {
      debug(err);
      reject( err );
    }
  });
}


function _registerNewUser(user) {

  return new Promise(function (resolve, reject) {
    try {
      var _aeResource = null;
      var _newUser = null;


      //  0. email이 이미 등록되어 있으면 fail
      UsersModel.count({email: user.email}).exec()

      .then(function(userCount){
        if(userCount > 0) {
          reject('Already used email');
        }
        else {
          _newUser = new UsersModel();
          _newUser.username = user.username;
          _newUser.email = user.email;
          if(!user.registerType){
            _newUser.password = _newUser.generateHash(user.password);
            _newUser.registerType = 'local';
          }else{
            _newUser.registerType = user.registerType ? user.registerType : '';
          }

          //  1. User AE 생성
          return onem2mManager.createUserAeResource(_newUser);
        }
      }, function(err) {
        debug('Fail to register new user.(while check whether email is already used', err);
        reject(err);
      })

      .then(function(aeResource) {
        _aeResource = aeResource;

        //  2. (AE Resource 생성이 성공된 경우) User DB에 등록
        return _newUser.save();
      }, function(err) {
        debug('Fail to register new user.(while creating user AE resource)', err);
        reject(err);
      })

      .then(function(userObj){
        //  3. User AE에 기본 ACP 생성
        return onem2mManager.createUserAcpResource(userObj, _aeResource);
      }, function(err) {
        debug('Fail to register new user.(while saving new user info to database)', err);
        reject(err);
      })

      //  4. ACPs DB에 등록
      .then(function(acpResource) {
        var newAcp = new AcpsModel();
        newAcp.owner = _newUser._id;
        newAcp.acpResource = acpResource['m2m:acp'];
        newAcp.acpId = acpResource['m2m:acp']['ri'];
        newAcp.acpName = acpResource['m2m:acp']['rn'];

        //  2. User DB에 등록
        return newAcp.save();
      }, function(err) {
        debug('Fail to register new user.(while creating default user ACP resource)', err);
        reject(err);
      })

      .then(function(acpObj){
        resolve(_newUser);
      }, function(err) {
        debug('Fail to register new user.(while saving ACP information to database)', err);
        reject(err);
      })

      .catch(function(err){
        debug('Fail to register new user.', err);
        reject(err);
      });
    }
    catch (ex) {
      debug('Fail to register new user.', ex);
      reject(ex);
    }
  });
}


function __generatePasswordResetEmail(user) {
  var mailOption = {
    from : '모비우스 웹포털 <' + global.CONFIG.email.sender + '>',
    to : user.username + '<' + user.email + '>',
    subject : '[발신전용] 모비우스 웹포털 비밀번호 재설정 안내',
    html: '<h1>모비우스 웹포털 비밀번호 재설정</h1>'
  };

  var mailContents = '<h1>모비우스 웹포털 비밀번호 재설정</h1>';
  mailContents += '비밀번호 재설정 링크: http://portal.iotocean.org/#!/password-change/' + user.resetPassordInfo.token;
  mailOption.html = mailContents;

  return mailOption;
}


function _requestToResetPassword(email) {

  var resObj = {
    statusCode: 200,
    message: 'OK',
    data: null
  };

  return new Promise(function(resolve, reject){
    try {
      //  1. check email exists or not
      UsersModel.findOne({email: email}).exec()

        .then(function(user){
          if(user != null) {

            //  2.1. if email exists save reset info(token + timestamp)
            return user.updatePasswordResetInfo();
          }
          else {
            resObj.statusCode = 404;
            resObj.message = '존재하지 않는 email';
            resObj.data = null;
            //  2.2. if email not exists, reject request
            return reject(resObj);
          }
        }, function(err){
          resObj.statusCode = 404;
          resObj.message = '존재하지 않는 email';
          resObj.data = null;

          //  2.2. if failed to get user info by email, reject request
          return reject(resObj);
        })

        .then(function(user){
          //  3.1 send password reset link to user

          var transporter = nodemailer.createTransport({
            service: global.CONFIG.email.service,
            auth: {
              user : global.CONFIG.email.sender,
              pass : global.CONFIG.email.secret
            }
          });

          var mailOption = __generatePasswordResetEmail(user);

          transporter.sendMail(mailOption, function(err, info) {
            if ( err ) {
              resObj.statusCode = 500;
              resObj.message = 'email 전송 오류';
              resObj.data = err.message;

              debug('Send Mail error', err.message);
              return reject(resObj);
            }
            else {
              resObj.statusCode = 200;
              resObj.message = 'OK';
              resObj.data = user.email;

              resolve(resObj);
            }
          });

        }, function(err){
          //  3.2 if email exists save reset info(token + timestamp)
          resObj.statusCode = 500;
          resObj.message = '비밀번호 재설정 실패';
          resObj.data = err.message;

          debug('Failed to reset password', err.message);
          return reject(resObj);
        })

        .catch(function(err){
          resObj.statusCode = 500;
          resObj.message = '비밀번호 재설정 실패';
          resObj.data = err.message;

          debug('Failed to reset password', err.message);
          return reject(resObj);
        });

    }
    catch(ex) {
      resObj.statusCode = 500;
      resObj.message = '비밀번호 재설정 실패';
      resObj.data = err.message;

      debug('Failed to reset password', err.message);
      return reject(resObj);
    }
  });
}

function _updateUserPassword(token, password, password2) {

  var resObj = {
    statusCode: 200,
    message: 'OK',
    data: null
  };

  return new Promise(function(resolve, reject){
    try {
      //  1. find user from given password reset token string
      UsersModel.findOne({"resetPassordInfo.token": token}).exec()

        .then(function(user){
          if(user != null) {

            //  TODO: 2. validation for timestamp



            //  2.1. if email exists save reset info(token + timestamp)
            return user.updatePassword(password);
          }
          else {
            resObj.statusCode = 400;
            resObj.message = '유효하지 않은 비밀번호 변경요청입니다';
            resObj.data = null;
            //  2.2. if email not exists, reject request
            return reject(resObj);
          }
        }, function(err){
          resObj.statusCode = 400;
          resObj.message = '유효하지 않은 비밀번호 변경요청입니다';
          resObj.data = null;

          //  2.2. if failed to get user info by email, reject request
          return reject(resObj);
        })

        .then(function(user){
          //  3.1 send password reset link to user
          resObj.statusCode = 200;
          resObj.message = 'OK';
          resObj.data = '';

          resolve(resObj);
        }, function(err){
          //  3.2 if email exists save reset info(token + timestamp)
          resObj.statusCode = 500;
          resObj.message = '비밀번호 재설정 실패';
          resObj.data = err.message;

          debug('Failed to change password', err.message);
          return reject(resObj);
        })

        .catch(function(err){
          resObj.statusCode = 500;
          resObj.message = '비밀번호 재설정 실패';
          resObj.data = err.message;

          debug('Failed to change password', err.message);
          return reject(resObj);
        });

    }
    catch(ex) {
      resObj.statusCode = 500;
      resObj.message = '비밀번호 재설정 실패';
      resObj.data = err.message;

      debug('Failed to change password', err.message);
      return reject(resObj);
    }
  });
}


/**
 * Expose 'UserManager'
 */
module.exports.findUserByEmail = _findUserByEmail;
module.exports.findUsersByEmail = _findUsersByEmail;
module.exports.registerNewUser = _registerNewUser;
module.exports.requestToResetPassword = _requestToResetPassword;
module.exports.updateUserPassword = _updateUserPassword;

