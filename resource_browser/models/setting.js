/**
 * 
 */

//var dbConnection = require('../util/db-connection');
var Promise = require('bluebird');
var debug = require('debug')('keti');


var Setting = function() {

}

Setting.listSettings = function(userId) {
  
  /*
  return dbConnection.getConnection()
    .then(function(conn) {
      debug( 'exec query' );
      //var res = conn.execute('select * from T_Setting LEFT JOIN T_User ON T_Setting.user_ref = T_User.obj_id WHERE T_User.user_id = ? ', userId.toString());
      var res = conn.execute('select cse_http_address, cse_http_port, cse_mqtt_address, cse_mqtt_port, number_of_result from T_Setting LEFT JOIN T_User ON T_Setting.user_ref = T_User.obj_id WHERE T_User.user_id = "' + userId + '"');
      conn.release();
      return res;
    }).then(function([rows, fields]){
      return rows;
    }).catch(function(err){
      debug( '[ERROR] Error when DB query: ' + err );
      throw err;
    });
  */
}


module.exports = Setting;
