var _ = require('underscore');
var path = require('path');
var debug = require('debug')('keti');

var ConfigUtil = function(jsonPath) {
  if (!jsonPath) {
    throw new Error("A config json file path must be present");
  }

  var configFile = path.join( __dirname, jsonPath );

  debug( 'CONFIG File path: ' + configFile );

  var config = require(configFile);

  var defaultConfig = config['default'];

  var configName = process.env.CONFIG;
  if(configName && config[configName] ) {

    _.extend( defaultConfig, config[configName] );
  }

  return defaultConfig;
}

module.exports = ConfigUtil;
