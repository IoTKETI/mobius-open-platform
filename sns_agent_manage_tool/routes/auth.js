var router = require('express').Router();
var authController = require('../controllers/auth.controller');

router.post('/', authController.userAuthenticate);

router.post('/re', authController.reIssueToken);

router.delete('/', authController.userSignOut);

router.get('/info', function(req, res, next) {
  var info = {};
  info.serviceUrl = CONFIG.domains;
  info.serviceUrl['domain'] = CONFIG.cookie.domain;

  res.status(200).json(info);
})
module.exports = router;