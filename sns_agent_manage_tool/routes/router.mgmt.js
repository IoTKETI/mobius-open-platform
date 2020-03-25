const router = require('express').Router();

const index = require('./index');
const user = require('./users');
const bot = require('./bot');
const command = require('./command');
const auth = require('./auth');

const tokenCheckMiddleware = require('../modules/tokenAuthenticater');

router.use('/user', user);
router.use('/bot', tokenCheckMiddleware.authTokenMiddleware, bot);
router.use('/cmd', tokenCheckMiddleware.authTokenMiddleware, command);
router.use('/auth', auth);

module.exports = router;