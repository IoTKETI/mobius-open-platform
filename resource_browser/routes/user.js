/**
 *
 *
 * "/user" route processor 
 *
 * 로그인  /user/{userid}/token?password=xxx GET {userid}와 password를 이용하여 사용자 인증
 * 로그아웃  /user/{userid}/token  DELETE  {userid}에 해당하는 사용자 로그아웃, JWT session과 {userid} 비교 필요
 * 
 * 사용자 목록 조회 /user GET 
 * 
 * 사용자 정보 조회 /user/{userid}  GET 
 * 사용자 ID 중복검사 /user/{userid}  HEAD 
 * 사용자 정보 수정 /user/{userid} PUT
 * 사용자 생성(가입)  /user/{userid} POST
 * 사용자 삭제(탈퇴)  /user/{userid} DELETE
 */

var express = require('express');
var debug = require('debug')('keti');

var router = express.Router();
var UserModel = require('../models/user');


/**
 * list all users
 *
 *  - required ADMIN role
 *  - query
 *    @keyword : search keyword
 *    @from : first index to return
 *    @last : last index to return
 *    @sort : identify ordering field
 *  - return (JSON)
 *    @users : Array of User object
 *    @from : first index to return 
 *    @last : last index to return
 *    @sort : identify ordering field
 */
router.get('/', function(req, res, next) {

  UserModel.listUsers()
    .then(function(rows){
      res.json(rows);
    }) ;
});


/**
 * get user information 
 *
 *  - required USER role
 *  - param
 *    @userid : user ID
 *  - return (JSON)
 *    User object
 */
router.get('/{userid}', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * check user ID where exists or not
 *
 *  - required USER role
 *  - param
 *    @userid : user ID
 *  - return (BOOLEAN)
 *    "TRUE" if aleady exists, otherwise "FALSE"
 */
router.get('/{userid}', function(req, res, next) {
  res.send('respond with a resource');
});


/**
 * create new user
 *
 *  - required NONE
 *  - body
 *    @id: user ID
 *    @name: name
 *    @email: email
 *  - return (JSON)
 *    User object
 */
router.post('/{userid}', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * update user information
 *
 *  - required USER role
 *  - body
 *    @name: name
 *    @email: email
 *  - return (JSON)
 *    User object
 */
router.put('/{userid}', function(req, res, next) {
  res.send('respond with a resource');
});


/**
 * delete user information
 * 
 *  - required USER role
 *  - return (JSON)
 *    User object
 */
router.delete('/{userid}', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
