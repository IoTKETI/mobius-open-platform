/**
 * Created by kimtaehyun on 2017. 12. 01.
 */

'use strict';


var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");


var debug = require('debug')('keti');

var UserManager = require('./user.manager.js');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;


function AuthManager(app, securityConfig) {

  var jwtOptions = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
  jwtOptions.secretOrKey = securityConfig.authSecret;


  var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    debug('payload received', jwt_payload);

    UserManager.findUserByUserid(jwt_payload.userid)

    .then(function(user){
      next(null, user);
    })
    .catch(function(err){
      next(null, false);
    });

  });

  passport.use(strategy);


  app.use(passport.initialize());
  app.use(passport.session());
}




/**
 * Expose 'AuthManager'
 */
module.exports.AuthManager = AuthManager;

module.exports.isAuthenticated = function(request){
  var acToken = request.header('ocean-ac-token');
  if(!acToken){
    return false;
  } 
  var result = jwt.verify(acToken, CONFIG.jwt_option.JWT_SECRET);
  if(result) {
    result.email = result.u_e;
    result.name = result.u_n;
    request.user = result;

    return true;
  } else {
    return false;
  }
}