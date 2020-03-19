var mysql = require('mysql2/promise');
var _ = require('underscore');
var debug = require('debug')('keti');

var __ConnectionPool = null;

var required = ['db_host', 'db_port', 'db_user', 'db_password', 'db_database'];
var DbConnections = function() {

  var appConfig = global.config;
  debug( appConfig );

  var dbConfig = _.pick(appConfig, required);

  _.each(required, function(element, index, list) {

    if( false == _.has(dbConfig, element)) {
      debug( '[ERROR] missing DB connection config "' + element + '"');
      throw new Error('missing DB connection config "' + element + '"');
    }
  });

  try {
      __ConnectionPool = mysql.createPool({
        host: dbConfig.db_host,
        port: dbConfig.db_port,
        user: dbConfig.db_user,
        password: dbConfig.db_password,
        database: dbConfig.db_database,
        cahrset: 'utf8_unicode_ci',
        typeCast: false,
        connectionLimit: 100,
        waitForConnections: true,
        debug: false,
        acquireTimeout: 50000,
        queueLimit: 0
      });
  }
  catch( e ) {
    debug( '[ERROR] ' + e );
  }     

  return __ConnectionPool;
}

module.exports = DbConnections();


