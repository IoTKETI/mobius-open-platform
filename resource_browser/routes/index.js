var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/info', function(req, res, next) {
  var info = {};
  info.serviceUrl = config.domains;
  info.serviceUrl['domain'] = CONFIG.cookie.domain;

  res.status(200).json(info);
})
module.exports = router;
