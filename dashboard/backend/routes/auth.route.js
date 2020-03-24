var express = require('express');
var router = express.Router();

var authManager = require('../managers/auth.manager.js');

/**
 * /auth/token	POST    Login
 * /auth/token	GET     Refresh access token
 * /auth/token	DELETE  Logout
 */




/*

headers: {
  ocean-ac-token: <access token>,
  ocean-re-token: <refresh token>
}	{
  atkn: <access token>,
  rrtkn: <refresh token>
}
headers: {
  ocean-ac-token: <access token>,
  ocean-re-token: <refresh token>
},
params: {
   type: <WEB | MOBILE | ADMIN>
}	N/A

 */

/**
 * [body]
 *  @userId: <userId>
 *  @passwd:  <password>,
 *  @type: <WEB | MOBILE | ADMIN>
 *
 * [response]
 *  @atkn: <access token>,
 *  @rtkn: <refresh token>
 *
 * [error]
 *  	ID not found or Password mismatched
 *  	Already logged in
 */
router.post('/token',   (req, res, next)=>{
  const userId = req.body.userId;
  const passwd = req.body.password;
  const type = req.body.type;

  //  TODO check parameter
  const secret = req.app.get('jwt-secret')

  authManager.login(userId, passwd, type, secret)
    .then((tokens)=>{
      res.status(200).json(tokens)
    })

    .catch((err)=>{
      res.status(401).json(err)
    })
});


router.use('/check', authManager.authCheck);
router.get('/check', authManager.check);

router.delete('/', authManager.userSignOut);
router.post('/re', authManager.tokenReIssue);
router.get('/info', function(req, res, next) {
  var info = {};
  info.serviceUrl = CONFIG.domains;

  res.status(200).json(info)
})
module.exports = router;
