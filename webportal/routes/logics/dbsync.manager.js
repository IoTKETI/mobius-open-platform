/**
 * Created by kimtaehyun on 2017. 12. 01.
 */

'use strict';

var debug = require('debug')('keti');
var AcpsModel = require('../models/model.acps.js');
var DevicesModel = require('../models/model.devices.js');
var UsersModel = require('../models/model.users.js');
var onem2mManager = require('./onem2m.manager.js');
var onem2mMqtt = require('../lib/onem2m-mqtt');
var onem2mClient = require('../lib/onem2m-client');

var shortid = require('shortid');

var schedule = require('node-schedule');

var Mqtt = require('mqtt');





var mqttClient = null;

var MQTT_URL = global.CONFIG.mobius.mqtt;
var WEBPORTA_SUB_NAME = global.CONFIG.mobius.subscriptionName;
var TARGET_IOT_PLATFORM_URL = global.CONFIG.mobius.host;
if(global.CONFIG.mobius.port)
  TARGET_IOT_PLATFORM_URL += ':' + global.CONFIG.mobius.port;
var TARGET_IOT_PLATFORM_CB_NAME = global.CONFIG.mobius.csebase;

var date = new Date(2014, 9, 18, 9, 30, 0);
/*
var j = schedule.scheduleJob(data, function(){
  console.log('....');
});
*/




function __mqttSubscribe(mqttClient, origin) {
  /*
    SPEC: TS-0010-V2.4.1 MQTT Protocol Binding

    6.4.2 Sending a Request

    /oneM2M/req/<originator>/<receiver>/<type>

    - <receiver> is the SP-relative-AE-ID or SP-relative-CSE-ID of the Receiver (AE, Transit CSE or Hosting
CSE) on this hop, omitting any leading

  */

  //  subscribe onem2m requet topic
  var reqTopic = '/oneM2M/req/#';
  debug( 'SUBSCRIBE MQTT : ' + reqTopic );
  mqttClient.subscribe(reqTopic);

  return mqttClient;
}

function __mqttMessageHandler(topic, message) {
  debug(topic + " :: " + message );

  var mesgObj = null;
  try {
    mesgObj = JSON.parse(message.toString());
  }
  catch(ex) {
    debug(ex);
  }

  if(mesgObj == null)
    return;

  //  mqtt req primitive param changed on Mobius 2.0
  var primitiveParameters = null;
  if( !mesgObj['m2m:rqp'] ) //  message가 request primitive인 경우만 처리
    primitiveParameters = mesgObj;
  else
    primitiveParameters = mesgObj['m2m:rqp'];

  //var primitiveParameters = mesgObj['m2m:rqp'];
  var operation = primitiveParameters['op'];
  var to = primitiveParameters['to'];
  var from = primitiveParameters['fr'];
  var reqId = primitiveParameters['rqi'];

  if( operation != '5' )  //  notification operation만 처리
    return;

  var notiEventType = primitiveParameters['net'];
  var primitiveContent = primitiveParameters['pc'];


  if(!__notificationMessageHandler(notiEventType, primitiveContent))
    return;

/*
  var handler = thisObj.eventHandlers['notification'];
  if( handler ) {

    handler(thisObj.mqttServerAddress, notiEventType, primitiveContent);
  }
*/

  //  publish response


  var topicArray = topic.split('/');
  var id = topicArray[3];
  var aeId = topicArray[4];

  var respObj = {
    'm2m:rsp': {
      'rsc': '2000',
      'to': aeId,
      'fr': id,
      'rqi': reqId,
      'pc': ''
    }
  };



  var respTopic = "/oneM2M/resp/" + id + "/" + aeId + "/json";
  mqttClient.publish(respTopic, JSON.stringify(respObj));

}

function __notificationMessageHandler(notiEventType, primitiveContent) {
  try {
    var sgn = primitiveContent['sgn'] || primitiveContent['m2m:sgn'];
    var representation = sgn.nev.rep;
    var resourceType = Object.keys(representation)[0];
    var sur = sgn.sur;

    //  Mobius Webportal에서 subscribe한 noti인지 확인
    var surTokens = sur.split('/');
    if(surTokens[surTokens.length-1] != WEBPORTA_SUB_NAME)
      return false;

    debug( 'MQTT Noti: ', notiEventType, representation[resourceType].rn);

    switch(notiEventType) {
      case '1' : // update of resource
        //  Device AE의 acpi 변경에 대해서만 처리
        if(representation[resourceType].api == 'MOBIUS.WEBPORTAL.USER')
          return true;

        _synchronizeDeviceAcps(representation[resourceType].ri)
          .then(function(result){
            debug('_synchronizeDeviceAcps', result);
          })
          .catch(function(err){
            debug('_synchronizeDeviceAcps', err);

          });
        break;

      case '2' : // delete of resource
        //  User AE의 삭제에 대해 처리
        //  Device AE의 삭제에 대해 처리

        break;

      case '3' : // create of direct child resource
        //  User AE의 child ACP resource 생성에 대해서만 처리


        break;

      case '4' :  //  deletion of direct child resource
        //  User AE의 child ACP resource 생성에 대해서만 처리


        break;
    }


    return true;
  }
  catch( e ) {
    debug( 'ERROR: while process MQTT notification message' );
    debug( e );
    debug( primitiveContent );

    return false;
  }
}


function _startMqttListener(mqttAddress) {

  mqttClient = Mqtt.connect(mqttAddress);

  mqttClient.on('connect', function () {
    __mqttSubscribe(mqttClient);
  });

  mqttClient.on('message', __mqttMessageHandler);




  if(true) {

    var targetCbUrl = TARGET_IOT_PLATFORM_URL + '/' + TARGET_IOT_PLATFORM_CB_NAME;

    DevicesModel.find().populate('owner').exec()
      .then(function (deviceList) {
        deviceList.map(function (device) {
          onem2mClient.Http.SubscribeTo(targetCbUrl + '/' + device.resourceInfo.resourceName, WEBPORTA_SUB_NAME, device.owner.email, MQTT_URL)
            .then(function (result) {

            })
            .catch(function (err) {
              debug('Fail to create SUB to device AE', err.message);
            });

        });
      })
      .catch(function (err) {

      });
  }
  if(true) {
    var targetCbUrl = TARGET_IOT_PLATFORM_URL + '/' + TARGET_IOT_PLATFORM_CB_NAME;

    UsersModel.find().exec()
      .then(function(userList){
        userList.map(function(user){
          debug('WEBPORTAL.USER', user.email );

          var aeName = 'WEBPORTAL.USER-' + user.email;
          onem2mClient.Http.SubscribeTo(targetCbUrl + '/' + aeName, WEBPORTA_SUB_NAME, user.email, MQTT_URL)
            .then(function(result){
            })
            .catch(function(err){
              debug('Fail to create SUB to user AE', err.message);
            });

        });
      })
      .catch(function(err){

      });

  }


}



/**
 * 주어진 deviceId에 해당하는 device AE resource의 acpi 정보와 DB의 acpi 정보를 동기화한다.
 * 또한 acpi가 참조하는 모든 ACP resource 정보도 DB의 acps collection 정보와 동기화를 한다.
 *
 * @param deviceId
 * @returns {*}
 * @private
 */
function _synchronizeDeviceAcps(deviceResourceId) {
  var _device = null;
  var _user = null;
  var _acpi = [];

  return new Promise(function(resolve, reject){
    try {

      //  TODO: DB에 없는 경우에는 추가해줘야 한다.
      //  find device with owner info
      DevicesModel.findOne({"resourceInfo.resourceId": deviceResourceId}).populate('owner').exec()

        .then(function(device){
          _device = device;
          _user = device.owner;

          //  3. get device resource
          return onem2mManager.getAeResource(_user, _device.resourceInfo.resourceName);
        })

        .then(function(deviceAe) {

          _device.resourceInfo.resourceObject = deviceAe['m2m:ae'];

          var acpiArray = deviceAe['m2m:ae'].acpi;
          _device.resourceInfo.acpi = acpiArray;

          return Promise.all( acpiArray.map(function(acpi){
            return new Promise(function(resolve, reject){
              try {
                onem2mManager.getResourceByResourceId(_user, acpi)
                  .then(function(acp){
                    resolve({success: true, acp: acp, error: null});
                  })
                  .catch(function(err){
                    resolve({success: false, acp: null, error: err});
                  });
              }
              catch(ex) {
                reject(ex);
              }
            });
          }));
        })


        .then(function(userAcpList) {
          var acpList = [];
          userAcpList.map(function(acpResult){
            if(acpResult.success) {
              acpList.push(acpResult.acp['m2m:acp']);
            }
          })

          return AcpsModel.bulkUpdateAcps(_user, acpList);
        })


        .then(function(result) {

          return _device.save();
        })

        .then(function(device){
          resolve(_device);
        })

        .catch(function(err){
          debug('Fail to synchronize device ACPs', err);
          reject(err);
        });


    } catch(ex) {

      debug('Fail to synchronize device ACPs', err);
      reject(err);
    }

  });

} //  end of function _updateAccessableIds


/**
 * 주어진 userEmail에 해당하는 모든 ACP resource 정보를 조회하여 DB의 acps collection 정보와 동기화를 한다.
 *
 * @param userEmail
 * @returns {*}
 * @private
 */
function _synchronizeUserAcps(userEmail) {
  var _device = null;
  var _user = null;
  var _acpi = [];

  return new Promise(function(resolve, reject){
    try {
      var _user = null;

      UsersModel.findOne({email: userEmail}).exec()

        .then(function(user){
          _user = user;

          return onem2mManager.listUserACPResources(_user)
        })

        .then(function(acpList){

          return AcpsModel.bulkUpdateAcps(_user, acpList);
        })

        .then(function(result) {

          resolve(result);
        })

        .catch(function(err){
          debug('Fail to synchronize user ACP list', err);
          reject(err);
        });


    } catch(ex) {

      debug('Fail to synchronize user ACP list', err);
      reject(err);
    }

  });

} //  end of function _updateAccessableIds



/**
 * Expose 'DeviceManager'
 */
module.exports.synchronizeDeviceAcps = _synchronizeDeviceAcps;
module.exports.synchronizeUserAcps = _synchronizeUserAcps;
module.exports.startMqttListener = _startMqttListener;

