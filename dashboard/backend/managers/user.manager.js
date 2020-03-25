const _ = require('lodash');

const PlatformError = require('./error.manager.js');
const User  = require('../models/user.model.js');
const debug = global.debug;
const m2mManager = require('./onem2m.manager.js');


exports.checkUserId = (userId, email)=>{
  return new Promise((resolve, reject)=> {
    try {
      User.checkUserExists(userId, email)
        .then((userDoc)=>{
          if(userDoc) {
            if(userDoc.userId == userId)
              throw new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'id-exists', 'User ID is already exists');
            else
              throw new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'email-exists', 'Email is already used');
          } else {
            resolve("OK");
          }
        })

        .catch((err)=> {
          debug.log("ERROR:", PlatformError.SOURCE.USER.SIGNIN, err);
          if (err instanceof PlatformError)
            return resolve(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'unknown', 'Fail to check ID'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.USER.SIGNIN, ex);
      reject(ex);
    }
  });
};



exports.signin = (signinInfo)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      User.checkUserExists(signinInfo.userId, signinInfo.email)
        .then((userDoc)=>{
          _userDoc = userDoc;

          if(userDoc) {
            if(userDoc.userId == signinInfo.userId)
              throw new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'id-exists', 'User ID is already exists');
            else
              throw new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'email-exists', 'Email is already used');
          } else {

            //  create user on database
            return User.create(signinInfo);
          }
        })

        .then((userDoc)=>{
          return m2mManager.createOrGetUserAEResource(userDoc.userId);
        })

        .then((userAe)=>{
          //  send email for activation user account
          resolve('Success');
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.USER.SIGNIN, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'unknown', 'Fail to signin'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.USER.SIGNIN, ex);
      reject(ex);
    }
  });
};


