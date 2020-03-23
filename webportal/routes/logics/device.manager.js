/**
 * Created by kimtaehyun on 2017. 12. 01.
 */

'use strict';

var debug = require('debug')('keti');
var UsersModel = require('../models/model.users.js');
var DevicesModel = require('../models/model.devices.js');
var AcpsModel = require('../models/model.acps.js');
var onem2mManager = require('./onem2m.manager.js');
var onem2mClient = require('../lib/onem2m-client');



var MQTT_URL = global.CONFIG.mobius.mqtt;
var WEBPORTA_SUB_NAME = global.CONFIG.mobius.subscriptionName;
var TARGET_IOT_PLATFORM_URL = global.CONFIG.mobius.host;
if(global.CONFIG.mobius.port)
  TARGET_IOT_PLATFORM_URL += ':' + global.CONFIG.mobius.port;
var TARGET_IOT_PLATFORM_CB_NAME = global.CONFIG.mobius.csebase;


/**
 * add(register) new device
 * @param user  login user
 * @param device  target device
 * @returns {*}
 * @private
 */
function _registerDevice(user, device) {
  var _device = device;
  var _user = user;
  var _acpName = '';
  var _resourceObj = null;
  var _newDevice = null;

  return new Promise(function(resolve, reject){
    UsersModel.findOne({email: user.email}).exec()

    .then(function(user) {
      _user = user;

      //  1. 이미 등록된 디바이스인지 확인한다.
      return DevicesModel.count({owner: _user._id, "resourceInfo.resourceName": _device.resourceInfo.resourceName }).exec();
    })

    .then(function(countResult){

      if(countResult > 0) {
        return reject('이미 등록된 리소스입니다.');
      }

      var acpName = 'WEBPORTAL.ACP-' + _user.email;
      var acor = {
        "acor": [_device.resourceInfo.resourceId],
        "acop":63
      };

      return onem2mManager.addAcrToACP(_user, acpName, acor)
    })

    .then(function(acpObj) {

      return AcpsModel.upsertAcp(_user, acpObj['m2m:acp']);
    })

    .then(function(acpObj){
      var acpId = acpObj.acpResource.ri;

      //  add login user ACP id to acpi property of target device AE
      return onem2mManager.grantAccessRights(_user, _device.resourceInfo.resourceId, acpId, true);
    })

    .then(function(acpObj){
      var newDevice = new DevicesModel(_device);
      newDevice.owner = _user._id;

      return newDevice.save();
    })

    .then(function(newDevice) {
      _newDevice = newDevice;

      var targetCbUrl = TARGET_IOT_PLATFORM_URL + '/' + TARGET_IOT_PLATFORM_CB_NAME;


      return onem2mClient.Http.SubscribeTo(targetCbUrl + '/' + _newDevice.resourceInfo.resourceName, WEBPORTA_SUB_NAME, _user.email, MQTT_URL)
    })

    .then(function (result) {

      resolve(_newDevice);
    }, function(err) {
      debug('Fail to create SUB to device AE', err.message);
      resolve(_newDevice);
    })

    .catch(function(err){
      debug(err);
      reject(err);
    });

  });
}

function _findDeviceResource(user, resourceName) {

  var _user = user;

  return new Promise(function(resolve, reject){
    UsersModel.findOne({email: user.email}).exec()

      .then(function(user) {
        _user = user;

        //  2. find device
        return DevicesModel.find({owner: _user._id, "resourceInfo.resourceName": resourceName }).exec();
      })

      .then(function(deviceList){

        if(deviceList.length > 0) {
          return reject('이미 등록된 리소스입니다.');
        }

        return onem2mManager.getAeResource(_user, resourceName);
      })

      .then(function(aeObj){

        resolve(aeObj);
      })

      .catch(function(err){
        debug(err);
        reject(err);
      });

  });
}

function _updateDeviceAcpi(user, deviceId, acpi, remove) {

  var _device = null;
  var removeFlag = (remove === undefined ? false : remove);
  return new Promise(function(resolve, reject){
    try {
      //  1. find user
      UsersModel.findOne({email: user.email}).exec()

        .then(function(user){

          //  2. find device
          return DevicesModel.findOne({owner: user._id, deviceId: deviceId}).populate('owner').exec();
        })

        .then(function(device){
          _device = device.toJSON();

          if(removeFlag) {
            return onem2mManager.revokeAccessRights(user, device.resourceInfo.resourceId, acpi);
          }
          else {
            return onem2mManager.grantAccessRights(user, device.resourceInfo.resourceId, acpi);
          }
        })

        .then(function(deviceAe) {

          resolve(_device);
        })

        .catch(function(err){
          debug('Fail to update device acpi', err);
          reject(err);
        });


    } catch(ex) {

      debug('Fail to update device acpi', ex);
      reject(err);
    }

  });

}


function _listDevices(user) {

  var _user = null;
  return new Promise(function(resolve, reject){

    UsersModel.findOne({email: user.email}).exec()

    .then(function(user) {
      _user = user;

      return AcpsModel.findAllGrantedAcpIds(_user.email);
    })

    .then(function(acpIdList){
      var query = {
        $or: [
          {"owner": _user._id},
          {
            "resourceInfo.acpi": {
              $elemMatch: {
                $in: acpIdList
              }
            }
          }
        ]
      };

      return DevicesModel.find(query).populate('owner').exec();
    })

    .then(function(devices){
      resolve(devices);
    })


    .catch(function(err){
      debug(err);
      reject(err);
    });

  });
}

function _countUserDevices(user) {

  var _user = null;
  return new Promise(function(resolve, reject){

    UsersModel.findOne({email: user.email}).exec()

    .then(function(user) {
      _user = user;

      var query = {
        "owner": _user._id
      };

      return DevicesModel.count(query).exec();
    })

    .then(function(deviceCount){
      resolve(deviceCount);
    })


    .catch(function(err){
      debug(err);
      reject(err);
    });

  });
}

function _countUserAcps(user) {

  var _user = null;
  return new Promise(function(resolve, reject){

    UsersModel.findOne({email: user.email}).exec()

    .then(function(user) {
      _user = user;

      var query = {
        "owner": _user._id
      };

      return AcpsModel.count(query).exec();
    })

    .then(function(deviceCount){
      resolve(deviceCount);
    })


    .catch(function(err){
      debug(err);
      reject(err);
    });

  });
}

function _countSharedDevices(user) {

  var _user = null;
  return new Promise(function(resolve, reject){

    UsersModel.findOne({email: user.email}).exec()

    .then(function(user) {
      _user = user;

      return AcpsModel.findAllGrantedAcpIds(_user.email);
    })

    .then(function(acpIdList){
      var query = {
        $and: [
          {"owner": {$ne: _user._id}},
          {
            "resourceInfo.acpi": {
              $elemMatch: {
                $in: acpIdList
              }
            }
          }
        ]
      };

      return DevicesModel.count(query).exec();
    })

    .then(function(deviceCount){
      resolve(deviceCount);
    })


    .catch(function(err){
      debug(err);
      reject(err);
    });

  });
}

function _getDeviceInfo(user, deviceId) {

  var _device = null;

  return new Promise(function(resolve, reject){
    try {
      //  1. find user
      UsersModel.findOne({email: user.email}).exec()

        .then(function(user){

          //  2. find device
          return DevicesModel.findOne({deviceId: deviceId}).populate('owner').exec();
        })

        .then(function(device){
          _device = device.toJSON();

          //  3. get device resource
          return onem2mManager.getAeResource(user, device.resourceInfo.resourceName);
        })

        .then(function(deviceAe) {

          _device.resourceInfo.resourceObject = deviceAe['m2m:ae'];

          var acpiArray = deviceAe['m2m:ae'].acpi;

          return Promise.all( acpiArray.map(function(acpi){
            return new Promise(function(resolve, reject){
              try {
                onem2mManager.getResourceByResourceId(user, acpi)
                  .then(function(acp){
                    resolve({success: true, acp: acp, error: null});
                  }, function(err){
                    resolve({success: false, acp: null, error: err});
                  });
              }
              catch(ex) {
                reject(ex);
              }
            });
          }));
        })


        .then(function(acpList){
          _device.acpList = [];
          acpList.map(function(acp){
            if(acp.success)
              _device.acpList.push(acp.acp['m2m:acp']);
          });

          resolve(_device);
        })

        .catch(function(err){
          debug('Fail to get device information', err);
          reject(err);
        });


    } catch(ex) {

      debug('Fail to get device information', err);
      reject(err);
    }

  });
}


function _unregisterDevice(user, deviceId) {

  var _device = null;
  var _user = null;

  return new Promise(function(resolve, reject){
    try {
      //  1. find user
      UsersModel.findOne({email: user.email}).exec()

        .then(function(user) {
          _user = user;

          return DevicesModel.findOne({owner: user._id, deviceId: deviceId}).populate('owner').exec();
        }, function(err){
          debug('Fail to unregister device information.(Error while find login user info.)', err);
          reject(err);
        })


        .then(function(device){

          if(device == null) {
            debug('Fail to unregister device information.(Error while get device information from DB.)', err);

            return reject(null);
          }

          _device = device;

          return onem2mManager.listUserACPResources(_user);
        }, function(err){
          debug('Fail to unregister device information.(Error while get device information from DB.)', err);
          reject(err);
        })


        .then(function(acpList) {
          var acpIds = [];
          acpList.map(function(acp){
            acpIds.push(acp.ri);
          });

          return onem2mManager.revokeAccessRights(_user, _device.resourceInfo.resourceId, acpIds);
        }, function(err){
          debug('Fail to unregister device information.(Error while get user ACP resources.)', err);
          reject(err);
        })


        .then(function(deviceAe) {

          var acpName = 'WEBPORTAL.ACP-' + _user.email;
          //  login user acp에서 device의 aei를 삭제해야 한다.
          return onem2mManager.deleteAcrFromACP(_user, acpName, deviceAe['m2m:ae'].aei);
        }, function(err){
          debug('Fail to unregister device information.(Error while remove ACP ID from acpi list on target resource.)', err);
          reject(err);
        })

        .then(function(acpObj) {

          return _device.remove();
        }, function(err){
          debug('Fail to unregister device information.(Error while remove device information from DB.)', err);
          reject(err);
        })

        .then(function(device){
          resolve( _device.deviceId );
        })

        .catch(function(err){
          debug('Fail to unregister device information.', err);
          reject(err);
        })
      ;


    } catch(ex) {

      debug('Fail to unregister device information.', err);
      reject(err);
    }

  });
}


function _deleteDeviceResource(user, deviceId) {

  var _device = null;
  var _user = null;

  return new Promise(function(resolve, reject){
    try {
      //  1. find user
      UsersModel.findOne({email: user.email}).exec()

        .then(function(user) {
          _user = user;

          return DevicesModel.findOne({owner: user._id, deviceId: deviceId}).populate('owner').exec();
        }, function(err){
          debug('Fail to unregister device information.(Error while finding login user info.)', err);
          reject(err);
        })

        .then(function(device){

          if(device == null) {
            debug('Fail to unregister device information.(Error while get device information from DB.)', err);

            return reject(null);
          }

          _device = device;

          return onem2mManager.deleteDeviceResource(_user, _device.resourceInfo.resourceId);
        }, function(err){
          debug('Fail to unregister device information.(Error while getting device information from DB.)', err);
          reject(err);
        })


        .then(function(resourceObj) {


          var acpName = 'WEBPORTAL.ACP-' + _user.email;
          //  login user acp에서 device의 aei를 삭제해야 한다.
          return onem2mManager.deleteAcrFromACP(_user, acpName, resourceObj['m2m:ae'].ri);
        })

        .then(function(acpObj){

          return _device.remove();
        }, function(err){
          debug('Fail to unregister device information.(Error while delete device resource.)', err);
          reject(err);
        })

        .then(function(device){
          resolve( _device.deviceId );
        })

        .catch(function(err){
          debug('Fail to delete device resource.(Error while remove device information form DB)', err);
          reject(err);
        })
      ;


    } catch(ex) {

      debug('Fail to delete device resource.', err);
      reject(err);
    }

  });
}


function _updateDeviceInfo(user, deviceId, deviceInfo) {

  var _device = null;

  return new Promise(function(resolve, reject){
    try {
      //  1. find user
      UsersModel.findOne({email: user.email}).exec()

        .then(function(user){

          //  2. find device
          return DevicesModel.findOne({owner: user._id, deviceId: deviceId}).populate('owner').exec();
        })

        .then(function(device) {
          device.deviceInfo.icon = deviceInfo.icon;
          device.deviceInfo.nickname = deviceInfo.nickname;
          device.deviceInfo.description = deviceInfo.description;

          return device.save();
        })

        .then(function(device){
          _device = device.toJSON();

          //  3. get device resource
          return onem2mManager.getAeResource(user, device.resourceInfo.resourceName);
        })

        .then(function(deviceAe) {

          _device.resourceInfo.resourceObject = deviceAe['m2m:ae'];

          var acpiArray = deviceAe['m2m:ae'].acpi;

          return Promise.all( acpiArray.map(function(acpi){
            return new Promise(function(resolve, reject){
              try {
                onem2mManager.getResourceByResourceId(user, acpi)
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


        .then(function(acpList){
          _device.acpList = [];
          acpList.map(function(acp){
            if(acp.success)
              _device.acpList.push(acp.acp['m2m:acp']);
          });

          resolve(_device);
        })

        .catch(function(err){
          debug('Fail to get device information', err);
          reject(err);
        });


    } catch(ex) {

      debug('Fail to get device information', err);
      reject(err);
    }

  });
}




/**
 * Expose 'DeviceManager'
 */
module.exports.getDeviceInfo = _getDeviceInfo;
module.exports.unregisterDevice = _unregisterDevice;
module.exports.deleteDeviceResource = _deleteDeviceResource;
module.exports.updateDeviceInfo = _updateDeviceInfo;
module.exports.updateDeviceAcpi = _updateDeviceAcpi;

module.exports.listDevices = _listDevices;
module.exports.findDeviceResource = _findDeviceResource;
module.exports.registerDevice = _registerDevice;

module.exports.countUserDevices = _countUserDevices;
module.exports.countSharedDevices = _countSharedDevices;
module.exports.countUserAcps = _countUserAcps;
