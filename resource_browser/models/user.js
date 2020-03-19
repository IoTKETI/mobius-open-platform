/**
 * 
 */

//var dbConnection = require('../util/db-connection');
var Promise = require('bluebird');
var debug = require('debug')('keti');


var User = function() {

}


User.listUsers = function() {
  /*

  return dbConnection.getConnection()
    .then(function(conn) {
      debug( 'exec query' );
      var res = conn.execute('select obj_id, user_id as id, user_name as name, email from T_User where delete_flag = "F" ' );
      conn.release();
      return res;
    }).then(function([rows, fields]){
      debug('success to query : ' + rows );
      return rows;
    }).catch(function(err){
      debug('fail to query : ' + err );
      throw err;
    });

  */
}

User.listSettings = function(userId) {

  /*
  return dbConnection.getConnection()
    .then(function(conn) {
      debug( 'exec query' );
      var res = conn.execute('select * from T_Setting LEFT JOIN T_User ON T_Setting.user_ref = T_User.obj_id WHERE T_User.user_id = "' + userId + '"');
      conn.release();
      return res;
    }).then(function([rows, fields]){
      debug('success to query : ' + rows );
      return rows;
    }).catch(function(err){
      debug('fail to query : ' + err );
      throw err;
    });
  */
}


module.exports = User;
