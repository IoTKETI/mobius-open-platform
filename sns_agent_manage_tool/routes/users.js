var express = require('express');
var router = express.Router();
const controller = require('../controllers/user.controller');

/* GET users listing. */
//get users list
router.get('/',  controller.getAllUsers);

router.get('/check', controller.checkUser);

router.get('/token', controller.checkValidToken);

//get a user
router.get('/:email', controller.getUser);

// 회원가입
router.post('/', controller.createUser);


router.put('/:email', controller.modifyUser);

router.delete('/del', controller.deleteUsers);

router.delete('/:email', controller.deleteUser);
module.exports = router;
