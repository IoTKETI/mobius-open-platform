/**
 *  Module dependencies
 */
var passport = require('passport');
var jwt = require('jsonwebtoken');
var UserManager = require('./user.manager.js');
var debug = require('debug')('keti');

/**
 *  Module variables
 */
var LocalStrategy = require('passport-local').Strategy;
var CustomStrategy = require('passport-custom').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
/**
 *  Configuration and Settings
 */
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {

  UserManager.findUserByEmail(email)
    .then(function(user){
      done(null, user);
    })

    .catch(function(err){
      debug('There was an error accessing the records of user with id: ' + id);
      done(err);
    });
});


/**
 *  Strategies
 */
//---------------------------Local Strategy-------------------------------------
passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    process.nextTick(function() {

      UserManager.findUserByEmail(email)

      .then(function(user) {
        if (user) {
          debug('user already exists');
          return null;
        }
        else {
          return UserManager.registerNewUser(req.body);
        }
      })

      .then(function(newUser) {

        if(newUser)
          done(null, newUser);
        else
          done(null, false, {errMsg: 'email already exists'});
      })

      .catch(function(err){
        debug(err);
        done(null, false, {errMsg: err});
      });
    });
  }));
//---------------------------local login----------------------------------------
passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {

    var _user = null;
    var _lastLoginTime = null;
    UserManager.findUserByEmail(email)

      .then(function(user) {
        if (!user) {
          debug('User does not exist');
          done(null, false, {errMsg: 'User does not exist, please signup first'});
        }

        else if(!user.validPassword(password)) {
          debug('Invalid password try again');
          done(null, false, {errMsg: 'Invalid password try again'});
        }

        else {
          _user = user;
          _lastLoginTime = user.lastLoginTime;

          return user.updateLastLogin(user._id);
        }
      })

      .then(function(updated){
        _user.lastLoginTime = _lastLoginTime;

        return done(null, _user)
      })

      .catch(function(err){
        debug(err);
        done(null, false, {errMsg: err.toLocaleString()});
      });
  }));
passport.use('custom-token', new CustomStrategy(function(req, done){
  var acToken = req.header('ocean-ac-token');
  try {
    if(!acToken){
      throw new Error("Invalid Token");
    } else {
      var result = jwt.verify(acToken, CONFIG.jwt_option.JWT_SECRET);
      if(!result){
        throw new Error("Invalid Token");
      } else {
        UserManager.findUserByEmail(result.u_e)
          .then(user => {
            done(null, user);
          })
          .catch(err => {
            done(err);
          })
      }
    }
  
  }catch(err){
    if(err.name === 'TokenExpiredError'){
      done({
        statusCode : 401,
        messsage : err
      });
    } else {
      done(err);
    }
  }
}))
//---------------------------Google login---------------------------------------- 

passport.use(new GoogleStrategy({
    clientID : CONFIG.google.client_id,
    clientSecret : CONFIG.google.client_secret,
    callbackURL : '/auth/login/google/callback'
  },function(accessToken, refreshToken, profile, done){

    /* save user infomation to Database */
    var email = profile.emails[0].value;

    if(!email){
      done(new Error("Google Profile has not Email"), null);
    }
    UserManager.findUsersByEmail(email)
    .then(res => {
      if(!res.length){ // New user
        var newbie = {
          userid : profile.id,
          username : profile.displayName,
          email : email,
          password : '',
          registerType : 'google'
        }
        return UserManager.registerNewUser(newbie)
      }else{
        return {email : email};
      }
    })
    .then(res2 => {
      done(null, { email : res2.email ? res2.email : res2._doc.email });
    })
    .catch(err => {
      debug(err);
      done(err, null);
    })
}));

/**
 *Export Module
 */
module.exports = passport;
