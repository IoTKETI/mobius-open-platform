const _ = require('lodash');

const PlatformError = require('./error.manager.js');
const debug = global.debug;


var onem2mClient = require('../libs/onem2m-client');
var onem2mMqtt = require('../libs/onem2m-mqtt');

var TARGET_IOT_PLATFORM_URL = global.CONFIG.iotplatform.host;
if(global.CONFIG.iotplatform.port)
  TARGET_IOT_PLATFORM_URL += ':' + global.CONFIG.iotplatform.port;

var TARGET_IOT_PLATFORM_CB_NAME = global.CONFIG.iotplatform.csebase;
var MQTT_URL = global.CONFIG.iotplatform.mqtt;


var DASHBOARD_USER_AE_PREFIX = "DSHBD_";
var DASHBOARD_TRIGGER_SUB_PREFIX = "DSHBD_SUB";


function __getResourceUrl(idOrPath) {

  var targetUrl = TARGET_IOT_PLATFORM_URL;
  if(idOrPath.startsWith('/')) {
    targetUrl += idOrPath;
  }
  else {
    targetUrl += '/' + idOrPath;
  }

  return targetUrl;
} //  end of __getResourceUrl function


/**
 * 로그인 사용자 계정에 대한 AE Resource를 조회/생성 하여 반환한다
 *
 * @param user 사용자 로그인 정보
 * @returns Promise(AEResourceObject)
 * @private
 */
function __getUserAeResource(userId) {

  var aeName = DASHBOARD_USER_AE_PREFIX + userId;
  var targetCbUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME);

  return new Promise(function(resolve, reject){
    try {

      var aeObject = {
        "m2m:ae": {
          "rn": aeName,
          "api": 'MOBIUS.DASHBOARD.USER',
          "lbl": ['KETI', 'Mobius', 'Dashboard', 'user', userId],
          "rr": true
        }
      };

      var origin = aeName;

      //  새로운 User AE resource를 생성한다.
      onem2mClient.Http.CreateResource(targetCbUrl, aeObject, origin)

        .then(function (aeResource) {

          //  생성 성공한 경우
          return aeResource;
        }, function (error) {

          //  생성이 실패한 경우 중 이미 해당 리소스가 존재하는 경우(409)
          if (error.statusCode === 409) {
            var aeUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + aeName);

            //  기존의 resource를 조회하여 반환한다.
            return onem2mClient.Http.GetResource(aeUrl, origin);
          }
          else {
            //  이외의 경우에는 error로 처리
            debug.log('Failed to get user AE', error);

            throw new PlatformError(PlatformError.SOURCE.M2M.USERAE, 'id-exists', 'User ID is already exists');
          }
        })

        .then(function(aeResource){
          resolve(aeResource);
        })

        .catch(function (err) {
          debug.log('Failed to get user AE', err);

          if (err instanceof PlatformError)
            return resolve(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.M2M.USERAEN, 'unknown', 'Fail to check ID'));
        })
      ;
    }
    catch(ex) {
      debug.log('Failed to get user AE', ex);

      return reject(new PlatformError(PlatformError.SOURCE.M2M.USERAE, 'unknown', 'Fail to check ID'));
    }
  });
} //  enf of __getUserAeResource function


function __getResource(origin, idOrPath){

  return new Promise(function(resolve, reject){
    try {

      var targetUrl = __getResourceUrl(idOrPath);

      onem2mClient.Http.GetResource(targetUrl, origin)

        .then(function (resourceObj) {

          resolve(resourceObj);
        })

        .catch(function (error) {
          debug.log('Failed to get resource', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug.log('Failed to get resource', ex);
      reject(ex);
    }
  });
} //  end of __getResource function

/**
 * Mobius에 user에 대한 AE Resource를 생성한다.
 *
 * @param user
 * @private
 */
function _createOrGetUserAEResource(userId) {

  return new Promise(function(resolve, reject) {

    try {
      //  get AE
      __getUserAeResource(userId)

        .then(function (aeResource) {
          resolve(aeResource);
        })

        .catch(function (err) {
          debug.log('Failed "__getUserAeResource"', err);
          reject(err);
        })
      ;

    } catch (ex) {
      debug.log('Exception "_createOrGetUserAEResource"', ex);
      reject(ex);
    }
  });
}


function _subscribeToTriggerNode(userId, widgetId, resourcePath) {

  return new Promise( function(resolve, reject) {
    try {
      var origin = DASHBOARD_USER_AE_PREFIX + userId;
      var notificationUrl = MQTT_URL + '/' + DASHBOARD_TRIGGER_SUB_PREFIX + '/' + origin + '/' + widgetId + '?ct=json';
      var targetUrl = __getResourceUrl(resourcePath);


      var resource = {
        'm2m:sub' : {
          'rn': DASHBOARD_TRIGGER_SUB_PREFIX + '_' + userId + '_' + widgetId,
          'enc': {
            'net': ['1', '2', '3', '4']
          },
          'nu': [notificationUrl],
          'nct': '1',
          'exc': 0
        }
      };

      onem2mClient.Http.CreateResource(targetUrl, resource, origin)
        .then( function(res){

          resolve(res);
        }, function(err){

          // subscription 생성 실패해도 mqtt subscribe할 수 있도록
          resolve(err);
        });

    }
    catch( ex ) {
      debug.log('Exception', ex);
      reject(ex);
    }

  });

}

function _retrieveLatestContentInstance(userId, resourcePath) {

  return new Promise( function(resolve, reject) {
    try {
      var origin = DASHBOARD_USER_AE_PREFIX + userId;
      var targetUrl = __getResourceUrl(resourcePath) + '/la';

      onem2mClient.Http.GetResource(targetUrl, origin)
        .then( function(res){

          resolve(res);
        }, function(err){

          // subscription 생성 실패해도 mqtt subscribe할 수 있도록
          resolve(err);
        });

    }
    catch( ex ) {
      debug.log('Exception', ex);
      reject(ex);
    }

  });

}


function _unsubscribeToTriggerNode(userId, widgetId, resourcePath) {

  return new Promise( function(resolve, reject) {
    try {
      var origin = DASHBOARD_USER_AE_PREFIX + userId;
      var targetUrl = __getResourceUrl(resourcePath) + '/' + DASHBOARD_TRIGGER_SUB_PREFIX + '_' + userId + '_' + widgetId;

      onem2mClient.Http.DeleteResource(targetUrl, origin)
        .then( function(res){

          resolve(res);
        }, function(err){

          // subscription 생성 실패해도 mqtt subscribe할 수 있도록
          resolve(err);
        });

    }
    catch( ex ) {
      debug.log('Exception', ex);
      reject(ex);
    }

  });

}


function _addMobiusListener(listener) {
  var mqttClient = onem2mMqtt.getClient(MQTT_URL, DASHBOARD_TRIGGER_SUB_PREFIX);
  mqttClient.on('notification', listener);
}




/**
 * Expose 'oneM2M Manager'
  */
module.exports.createOrGetUserAEResource = _createOrGetUserAEResource;
module.exports.addMobiusListener = _addMobiusListener;
module.exports.subscribeToTriggerNode = _subscribeToTriggerNode;
module.exports.retrieveLatestContentInstance = _retrieveLatestContentInstance;
module.exports.unsubscribeToTriggerNode = _unsubscribeToTriggerNode;
