var router = require('express').Router();

var user = require('./userMgmt');
var ae = require('./aeMgmt');
var auth = require('./auth');
var fw = require('./fs');

var authMiddle = require('../middlewares/tokenAuthenticater');

router.use('/user', user);
router.use('/ae', authMiddle.authTokenMiddleware, ae);
router.use('/auth', auth);

module.exports = router;
