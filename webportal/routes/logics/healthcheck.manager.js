/**
 * Created by kimtaehyun on 2017. 12. 01.
 */

'use strict';

var debug = require('debug')('keti');
var onem2mClient = require('../lib/onem2m-client');
var nodemailer = require('nodemailer');

var schedule = require('node-schedule');

var MQTT_URL = global.CONFIG.target.mqtt;
var TARGET_IOT_PLATFORM_URL = global.CONFIG.target.host;
if(global.CONFIG.target.port)
  TARGET_IOT_PLATFORM_URL += ':' + global.CONFIG.target.port;
var TARGET_IOT_PLATFORM_CB_NAME = global.CONFIG.target.csebase;

var date = new Date(2014, 9, 18, 9, 30, 0);
/*
var j = schedule.scheduleJob(data, function(){
  console.log('....');
});
*/


function _startHealthChecker() {


  var transporter = nodemailer.createTransport({
    service: global.CONFIG.email.service,
    auth: {
      user : global.CONFIG.email.sender,
      pass : global.CONFIG.email.secret
    }
  });

  var mailOption = __generatePasswordResetEmail(user);

  transporter.sendMail(mailOption, function(err, info) {
    if ( err ) {
      resObj.statusCode = 500;
      resObj.message = 'email 전송 오류';
      resObj.data = err.message;

      debug('Send Mail error', err.message);
      return reject(resObj);
    }
    else {
      resObj.statusCode = 200;
      resObj.message = 'OK';
      resObj.data = user.email;

      resolve(resObj);
    }
  });

}


/**
 * Expose 'DeviceManager'
 */
module.exports.startHealthChecker = _startHealthChecker;


