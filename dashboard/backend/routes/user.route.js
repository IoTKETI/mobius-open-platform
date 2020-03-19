var express = require('express');
var router = express.Router();

var userManager = require('../managers/user.manager.js')


/**
 * /user                    POST	Sign in
 * /user/idcheck            GET	Check user ID is in used
 * /user                    PUT	Update user profile
 * /user/:userId            DELETE	Un subscribe
 * /user/password/reset     POST	Reset password request
 * /user/password/:token    PUT	Change password (with password reset token)
 * /user/password           PUT	Change password (with access token)
 */


/**
 * [ URL ]
 * GET /user/idcheck
 *
 * [ params ]
 * @userName: <user name>
 * @userId: <user id>
 * @eamil: <email>
 * @password: <password>
 * @passwordCheck: <passwordChech>
 *
 * [ error ]
 * - ID already exists
 * - password mismatched
 * - ID is not available */
router.get('/idcheck', (req, res, next)=>{

  var userId = req.query.userId;
  var email = req.query.email;

  //  TODO check parameter
  userManager.checkUserId(userId, email)
    .then((result)=>{
      res.status(200).json(result)
    })

    .catch((err)=>{
      res.status(400).json(err)
    })
});








/**
 * [ URL ]
 * POST /user
 *
 * [ body ]
 * @userName: <user name>
 * @userId: <user id>
 * @eamil: <email>
 * @password: <password>
 * @passwordCheck: <passwordChech>
 *
 * [ error ]
 * - ID already exists
 * - password mismatched
 * - ID is not available
 */
router.post('/', (req, res, next)=>{

  var signinInfo = {
    "userName": req.body.userName,
    "userId": req.body.userId,
    "email": req.body.email,
    "password": req.body.password,
    "passwordCheck": req.body.passwordCheck
  };

  //  TODO check parameter


  userManager.signin(signinInfo)
    .then((success)=>{
      res.status(200).json(success)
    })

    .catch((err)=>{
      res.status(400).json(err)
    })
});

// router.post('/token', authManager.login);
//
// router.use('/check', authManager.authCheck);
// router.get('/check', authManager.check);

module.exports = router;
