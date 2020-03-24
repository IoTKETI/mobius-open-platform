var express = require('express');
var router = express.Router();
var debug = require('debug')('keti');

var passport = require('./logics/passport.config.js');
var authManager = require('./logics/auth.manager');
var userManager = require('./logics/user.manager.js');
var tokenMgmtService = require('./logics/token.manager');
var tokenMakeService = require('./logics/tokenMakeService');
var jwt = require('jsonwebtoken');



router.post('/login', function(req, res, next) {
  passport.authenticate('local-login', {
    session : false
  },function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (!user) {
      return res.status(401).send(info.errMsg);
    }

    req.login(user, function (err) {
      if (err) {
        debug(err);
        return next(err);
      }

      var loginUser = {
        username: user.username,
        email: user.email,
        lastLoginTime: user.lastLoginTime
      };
      var acTokenPromise = tokenMakeService.createAccessToken(loginUser);
      var reTokenPromise = tokenMakeService.createRefreshToken(user.email);
      Promise.all([acTokenPromise, reTokenPromise])
        .then(values => {
          var acToken = values[0];
          var reToken = values[1];
          if(!acToken || !reToken){
            return res.status(500).send({message : "로그인 도중 장애가 발생헀습니다."});
          }else {
            res.cookie('ocean-ac-token', acToken, {
              domain : CONFIG.cookie.domain,
              expires : null,
              maxAge : CONFIG.cookie.acMaxAge,
            });
            res.cookie('ocean-re-token', reToken, {
              domain : CONFIG.cookie.domain,
              expires : null,
              maxAge : CONFIG.cookie.reMaxAge,
            });
            res.setHeader('Access-Control-Expose-Headers', 'ocean-ac-token, ocean-re-token');
            return res.status(200).send(loginUser);
          }
        })
    });
  })(req, res, next);
});


router.post('/logout', function(req, res, next) {

  var email = req.body.email;
  if(!authManager.isAuthenticated(req)){
    if(!email){
      res.status(401).json({
        message : "잘못된 접근입니다."
      });
      return;
    }
  } else {
    email = req.user.email;
    req.logout();
  }

  userManager.findUserByEmail(email)
    .then(user => {
      if(!user){
        throw new Error("존재 하지 않는 회원정보 입니다.");
      }
      return tokenMgmtService.removeRefreshToken(user);
    })
    .then(() => {
      res.status(200).json({
        domain : CONFIG.cookie.domain
      });
    })
    .catch(err => {
      res.status(500).send(err);
    })

});


router.get('/user', function(req, res, next) {
  passport.authenticate('custom-token', {
    session : false
  },function (err, user, info) {
    if (err && err.statusCode) {
      return res.status(err.statusCode).send(err); // will generate a 500 error
    } else if(err && !err.statusCode) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send(info.errMsg);
    }

    req.login(user, function (err) {
      if (err) {
        debug(err);
        return next(err);
      }

      var loginUser = {
        username: user.username,
        email: user.email,
        lastLoginTime: user.lastLoginTime
      };
      tokenMakeService.createAccessToken(loginUser)
        .then(acToken => {
          if(!acToken){
            return res.status(500).send({message : "로그인 도중 장애가 발생헀습니다."});
          }else {
            res.cookie('ocean-ac-token', acToken, {
              domain : CONFIG.cookie.domain,
              maxAge : CONFIG.cookie.acMaxAge
            });
            res.setHeader('ocean-ac-token', acToken);
            res.setHeader('Access-Control-Expose-Headers', 'ocean-ac-token, ocean-re-token');
            return res.status(200).send(loginUser);
          }
        })
    });
  })(req, res, next);
});



router.post('/signup', function(req, res, next) {
  passport.authenticate('local-signup', {session : false}, function(err, user, info) {
    if (err) {
      return res.status(500).send(err); // will generate a 500 error
    }
    if (!user) {
      return res.status(409).send(info.errMsg);
    }
    req.login(user, function(err){
      if(err){
        debug(err);
        return next(err);
      }
      return res.status(200).send('OK');
    });
  })(req, res, next);
});


router.post('/password/reset-token', function(req, res, next) {
  var requestUserEmail = req.body.email;

  userManager.requestToResetPassword(requestUserEmail)
    .then(function(result){
      res.status(result.statusCode).send(result.data);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});

router.put('/password', function(req, res, next) {
  var resetToken = req.body.token;
  var password = req.body.password;
  var password2 = req.body.passwordConfirm;

  userManager.updateUserPassword(resetToken, password, password2)
    .then(function(result){
      res.status(result.statusCode).send(result.data);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});

router.get('/login/google', passport.authenticate('google', {
  scope : [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
}))

router.get('/login/google/callback', passport.authenticate('google',{
  successRedirect : '/',
  failureRedirect : '/auth/login'
}))

router.post('/re/check', function(req, res, next){
  var oceanReToken = req.header('ocean-re-token');
  var email = req.body.email;
  if(!oceanReToken){
    res.status(401).json({
      message : "Token 정보가 없습니다."
    })
    return;
  } else if(!email){
    res.status(401).json({
      message : "로그인 정보가 일치하지 않습니다."
    });
    return;
  }

  tokenMgmtService.findTokenExist(email, oceanReToken)
    .then(() => {
      res.status(200).json({
        result : true
      })
    })
    .catch(err => {
      res.status(401).send(err);
    })
})

router.post('/re/issue', function(req, res, next){
  var oceanReToken = req.header('ocean-re-token');
  var email = req.body.email;
  if(!oceanReToken){
    res.status(401).json({
      message : "Token 정보가 없습니다."
    })
    return;
  }
  userManager.findUserByEmail(email)
    .then(user => {
      var loginUser = {
        username: user.username,
        email: user.email,
        lastLoginTime: user.lastLoginTime
      };
      return tokenMakeService.createAccessToken(loginUser);
    })
    .then(acToken => {
      if(!acToken){
        res.status(500).send({message : "로그인 도중 장애가 발생헀습니다."});
      }else {
        res.json({
          token : acToken,
          domain : CONFIG.cookie.domain,
          maxAge : CONFIG.cookie.acMaxAge
        })
        res.status(200).send();
      }
    })
    .catch(err => {
      res.status(err.status || 500).send(err);
    })
})

router.post('/re/token', function(req, res, next){
  var oceanReToken = req.header('ocean-re-token');
  if(!oceanReToken){
    res.status(401).json({
      message : "Token 정보가 없습니다."
    })
    return;
  }
  
  var email = jwt.decode(oceanReToken).u_e;
  if(!email){
    res.status(411).json({
      message : "유효하지 않은 데이터가 전달되었습니다."
    });
    return;
  }
  userManager.findUserByEmail(email)
    .then(user => {
      var loginUser = {
        username: user.username,
        email: user.email,
        lastLoginTime: user.lastLoginTime
      };
      return tokenMakeService.createAccessToken(loginUser);
    })
    .then(acToken => {
      if(!acToken){
        res.status(500).send({message : "로그인 도중 장애가 발생헀습니다."});
      }else {
        res.cookie("ocean-ac-token", acToken, {
          domain : CONFIG.cookie.domain,
          maxAge : CONFIG.cookie.acMaxAge
        })
        res.status(200).send();
      }
    })
    .catch(err => {
      res.status(err.status || 500).send(err);
    })
})

router.get('/info', function(req, res, next) {
  var info = {};
  info.serviceUrl = CONFIG.domains;
  res.status(200).json(info);
})
module.exports = router;
