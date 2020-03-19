var express = require('express');
var router = express.Router();

var authManager = require('../managers/auth.manager.js')




/* GET virtual space listing. */
router.post('/user', authManager.register);

router.post('/token', authManager.login);

router.use('/check', authManager.authCheck);
router.get('/check', authManager.check);

module.exports = router;
