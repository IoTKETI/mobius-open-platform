var router = require('express').Router();
var userMgmt = require('../controllers/userMgmtController');

var authMiddle = require('../middlewares/tokenAuthenticater');

router.post('/', userMgmt.createUser);

router.put('/', authMiddle.authTokenMiddleware, userMgmt.modifyUserInfo);

router.delete('/', authMiddle.authTokenMiddleware, userMgmt.leaveUser);

router.get('/list', authMiddle.authTokenMiddleware, userMgmt.getUserList);

router.get('/check', userMgmt.checkEmailDuplicate);

router.put('/:email', authMiddle.authTokenMiddleware, userMgmt.resetPassword);

router.get('/:email', authMiddle.authTokenMiddleware, userMgmt.getUserInfomation);

router.delete('/del', authMiddle.authTokenMiddleware, userMgmt.deleteUser);



module.exports = router;