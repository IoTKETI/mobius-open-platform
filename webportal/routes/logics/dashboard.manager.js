/**
 * Created by kimtaehyun on 2017. 12. 01.
 */

'use strict';

var debug = require('debug')('keti');
var UsersModel = require('../models/model.users.js');
var onem2mManager = require('./onem2m.manager.js');
var deviceManager = require('./device.manager.js');



function _getUserCount() {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      UsersModel.count({}).exec()
        .then(function(count) {

          result.success = true;
          result.data = count;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}


function _getAECount() {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      onem2mManager.countAEs()
        .then(function(count) {

          result.success = true;
          result.data = count;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}


function _getTotalCBS() {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      onem2mManager.getTotalCINSize()
        .then(function(count) {

          result.success = true;
          result.data = count;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}

function _getTrafficData() {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      onem2mManager.getTrafficData()
        .then(function(hits) {

          result.success = true;
          result.data = hits;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}



function _countUserDevices(user) {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      if(user == null) {
        result.success = true;
        return resolve(result);
      }

      deviceManager.countUserDevices(user)
        .then(function(count) {

          result.success = true;
          result.data = count;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}


function _countSharedDevices(user) {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      if(user == null) {
        result.success = true;
        return resolve(result);
      }

      deviceManager.countSharedDevices(user)
        .then(function(count) {

          result.success = true;
          result.data = count;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}


function _countUserAcps(user) {

  var result = {
    success: false,
    data: 0,
    error: null
  };

  return new Promise(function(resolve, reject){
    try {
      if(user == null) {
        result.success = true;
        return resolve(result);
      }

      deviceManager.countUserAcps(user)
        .then(function(count) {

          result.success = true;
          result.data = count;

          resolve(result);
        })

        .catch(function(err) {
          result.success = false;
          result.error = err;

          resolve(result);
        });
    }
    catch(ex) {
      debug(ex);
      result.success = false;
      result.error = ex;
      resolve(result);
    }
  });
}


function _getDashboardData(user) {
  return new Promise(function(resolve, reject){

    try {
      var returnObj = {};

      _getUserCount()
        .then(function(result){

          returnObj.numberOfUsers = result;

          return _getAECount();
        })

        .then(function(result){
          returnObj.numberOfAEs = result;

          return _getTotalCBS();
        })

        .then(function(result){
          returnObj.totalCBS = result;

          return _getTrafficData();
        })

        .then(function(result){
          returnObj.trafficData = result;

          return _countUserDevices(user);
        })

        .then(function(result){
          returnObj.userDevices = result;

          return _countSharedDevices(user);
        })

        .then(function(result){
          returnObj.sharedDevices = result;

          return _countUserAcps(user);
        })

        .then(function(result){
          returnObj.userAcps = result;

          return resolve(returnObj);
        })



        .catch(function(err){
          debug(err);
          resolve(returnObj);
        });

    }

    catch(ex){
      debug(ex);
      reject(ex);
    };

  });
}

/**
 * Expose 'DashboardManager'
 */
module.exports.getDashboardData = _getDashboardData;

