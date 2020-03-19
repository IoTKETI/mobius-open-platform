var router = require('express').Router();
var authController = require('../controllers/auth.controller');

router.post('/', authController.userAuthenticate);

router.post('/re', authController.reIssueToken);

router.delete('/', authController.userSignOut);
module.exports = router;