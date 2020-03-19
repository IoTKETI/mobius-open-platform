var router = require('express').Router();
var authController = require('../controllers/authController');

router.post('/', authController.userAuthenticate);

router.post('/re', authController.reIssueToken);

router.delete('/', authController.userSignOut);
module.exports = router;