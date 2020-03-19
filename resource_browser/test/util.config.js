var debug = require('debug')('keti');

process.env.CONFIG = 'thkim';

global.config = require('../util/config.js')('../bin/config.json');

var UserModel = require('../models/user');
var SettingModel = require('../models/setting');
UserModel.listUsers()
  .then(function(rows){

    debug( 'listUsers ======================' ) ;
    debug( JSON.stringify(rows) );
    debug( '======================' ) ;
  }) ;


SettingModel.listSettings('user002')
  .then(function(rows){

    debug( 'listSettings ======================' ) ;
    debug( JSON.stringify(rows) );
    debug( '======================' ) ;
  }) ;

