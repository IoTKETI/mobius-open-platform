const jwt   = require('jsonwebtoken');
const PlatformError = require('./error.manager.js');
const User  = require('../models/user.model.js');
const http = require('request-promise');
const tokenManager = require('./token.manager');
const SECURITY_CONFIG = global.CONFIG.security;

//  const resourceManager = require('./resource.manager.js');

/*
    POST /auth
    {
        userId,
        password
    }
*/


exports.tokenParser = ()=>{

  return function(req, res, next) {
    try {
      // read the token from header or url
      const token = req.headers['ocean-ac-token'] || req.query.token;
      const secret = req.app.get('jwt-secret');

      // token does not exist
      if(!token) {
        req.auth = null;
        return next();
      }

      var auth  = {
        token: token
      };

      jwt.verify(token, secret, (err, authToken) => {
        if(err) {
          auth.parsed = null;
          auth.error = err;

          req.auth = auth;
          next();
        }
        else {
          auth.parsed = authToken;
          authToken.userId = authToken.u_e;
          auth.error = null;

          req.auth = auth;
          User.findOne({email : authToken.u_e}).exec()
            .then(user => {
              if(!user){
                return new User({
                  userName : authToken.u_n,
                  userId : authToken.u_e,
                  email : authToken.u_e
                }).save();
              }
            })
          next();
        }
      });
    }
    catch(ex) {
      next();
    }
  };
}






exports.login = (userId, passwd, type, secret) => {

  return new Promise((resolve, reject)=>{
    try {
      //  find user info by userId
      User.findOneByUserId(userId)
        .then((user)=> {

          //  if their is no user throw error
          if (!user) {
            throw new PlatformError(PlatformError.SOURCE.AUTH.LOGIN, 'no-user-id', 'User ID is not registered');
          }
          else {
            //  otherwise, verify password

            if (!user.verify(passwd)) {
              //  in case of fail to verify password, throw error
              throw new PlatformError(PlatformError.SOURCE.AUTH.LOGIN, 'invalid-password', 'Password is not matched');
            }
            else {
              //  check refresh token
              var refreshToken = user.getRefreshToken(type);
              if (!refreshToken) {
                //  create new refresh token if user account has no refresh token on DB
                return user.createRefreshToken(type);
              }
              else {
                return user;
              }
            }
          }
        })

        .then((user)=>{
          //
          var claims = {
            userName: user.userName,
            userId: user.userId,
          };

          var signOptions = {
            expiresIn: SECURITY_CONFIG.expiresIn[type]['access'],
            issuer: SECURITY_CONFIG.tokenIssuer,
            subject: SECURITY_CONFIG.tokenSubject
          };

          jwt.sign(claims, secret, signOptions, (err, token) => {
            if (err) {
              debug.log("ERROR:", PlatformError.SOURCE.AUTH.LOGIN, err);
              reject(new PlatformError(PlatformError.SOURCE.AUTH.LOGIN, 'jwt-sign', 'Fail to make token'))
            }

            var result = {
              "atkn": token,
              "rtkn": user.refreshTokens[type].token
            };

            return resolve(result);
          })
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.AUTH.LOGIN, err);
          if(err instanceof PlatformError)
            reject(err);
          else
            reject(new PlatformError(PlatformError.SOURCE.AUTH.LOGIN, 'unknown', 'Fail to login'));
        })

    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.AUTH.LOGIN, ex);
      reject(ex);
    }
  });

};

exports.check = (req, res) => {
  res.json({
    success: true,
    info: req.auth
  })
};



exports.authCheck = (req, res, next) => {

  if(!req.auth) {
    return res.status(403).json({
      success: false,
      message: 'Login required'
    });
  }

  else if(req.auth.parsed) {
    return next();
  }

  else {
    var message = 'Unknown';
    if(req.auth && req.auth.error)
      message = req.auth.error.toString();


    return res.status(403).json({
      success: false,
      message: message
    });
  }
};

exports.userSignOut = (req, res) => {
  if(!Object.prototype.hasOwnProperty.call(req.query, 'email')){
    sendError (res, null, '로그아웃 처리에 실패했습니다. 다시 해주세요');
    return;
}
try{
    let email = req.query.email;
    // 로그아웃이라면 저장되어 있는 Refresh토큰을 제거한다.
    http({
      uri : CONFIG.domains.WEBPORTAL + "/auth/logout",
      method : "post",
      headers : {
        "accept" : "application/json"
      },
      body : {
        "email" : email
      },
      json : true
    })
    .then(result => {
        res.cookie('ocean-ac-token', null, {
            domain : result.domain,
            maxAge : 0
        });
        res.cookie('ocean-re-token', null, {
            domain : result.domain,
            maxAge : 0
        });
        res.status(200).json({
            message : '성공적으로 로그아웃 되었습니다. 감사합니다.'
        })
        LOGGER.info(`[AUTH] : ${email}님이 로그아웃 했습니다.`);
    }).catch(err => {
        sendError (res, err, '로그아웃 도중 문제가 발생했습니다. 지속시 관리자에게 문의 바랍니다.');
    })
}catch(err){
    sendError (res, err, '로그아웃 도중 문제가 발생했습니다. 지속시 관리자에게 문의 바랍니다.');
}
}

exports.tokenReIssue = function(req, res, next){
  var reToken = req.header('ocean-re-token');
  if(!reToken){
      res.status(401).send("로그인이 필요합니다.");
      return;
  }
  tokenManager.checkValidToken(reToken)
    .then((rs) => {
        return tokenManager.requestNewAccessToken(reToken)
    })
    .then((cookie) => {
        
        res.cookie('ocean-ac-token', cookie.token, {
            domain : cookie.domain,
            expires : null,
            maxAge : cookie.maxAge
          });
        res.status(200).send();
    })
    .catch(err => {
        res.status(err.status || 500).send(err);
    })
}