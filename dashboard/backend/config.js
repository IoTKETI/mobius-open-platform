var _ = require('lodash');
var path = require('path');
var fs = require('fs');

var CONFIG_FILE_NAME = 'config.json';
var USER_CONFIG_FILE_NAME = 'user.config.json';

var debug = {
  log: require('debug')('keti.log')
};


var ConfigUtil = function() {

  var configFile = path.join( __dirname, CONFIG_FILE_NAME );
  var userConfigFile = path.join( __dirname, USER_CONFIG_FILE_NAME );

  var config = require(configFile);
  var userConfig = null;
  try{
    userConfig = require(userConfigFile);
  }
  catch(ex) {

  }

  var defaultConfig = config['default'];

  var configName = process.env.CONFIG;
  if(configName && config[configName] ) {

    _.extend( defaultConfig, config[configName] );
  }

  if(userConfig) {
    _.extend( defaultConfig, userConfig );
  }

  return defaultConfig;
}



function _saveConfiguration(config) {

  try {
    var options = {encoding:'utf8',flag:'w'};
    fs.writeFileSync(path.join( __dirname, USER_CONFIG_FILE_NAME ), JSON.stringify(config), options);


    _.extend( global.CONFIG, config );

    var apiController = require( '../controllers/api.controller.js');
    apiController.dataLogger.terminate()
      .then(function(){
        apiController.dataLogger.startup();

      });

  }
  catch(ex){
    debug.log('Fail to save config:', ex);
  }

}


module.exports = ConfigUtil;
module.exports.saveConfiguration = _saveConfiguration;
