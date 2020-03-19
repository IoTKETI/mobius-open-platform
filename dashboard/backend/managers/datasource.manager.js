const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp-promise');
const decache = require('decache');

const PlatformError = require('./error.manager.js');
const onem2mManager = require('./onem2m.manager.js');
const UserModel  = require('../models/user.model.js');
const DatasourcesModel  = require('../models/datasource.model.js');

const debug = global.debug;
const SYSTEM_DIRECTORIES = global.CONFIG.directories;

exports.updateDatasource = (userId, datasourceId, updateData)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _datasourceDoc = null;

      //  find user
      UserModel.findOneByUserId(userId)
        .then((userDoc)=> {
          if(userDoc) {
            return DatasourcesModel.upsertDatasource(userDoc, datasourceId, updateData);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((datasourceDoc)=>{
          _datasourceDoc = datasourceDoc;

          if( updateData.triggerInfo ) {
            return saveDatasourceCode(userId, datasourceId, updateData.triggerInfo);
          }
          else {
            return null;
          }
        })
        .then(()=>{

          resolve(_datasourceDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.DATASOURCE.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Fail to get gateway info'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.DATASOURCE.LIST, ex);
      reject(ex);
    }
  });
};

exports.updateWidgetData = (userId, datasourceId, widgetData)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _datasourceDoc = null;
      var updateData = {
        'widgetData': widgetData
      };

      //  find user
      UserModel.findOneByUserId(userId)
        .then((userDoc)=> {
          if(userDoc) {
            return DatasourcesModel.upsertDatasource(userDoc, datasourceId, updateData);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((datasourceDoc)=>{
          _datasourceDoc = datasourceDoc;

          if( updateData.triggerInfo ) {
            return saveDatasourceCode(userId, datasourceId, updateData.triggerInfo);
          }
          else {
            return null;
          }
        })
        .then(()=>{

          resolve(_datasourceDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.DATASOURCE.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Fail to get gateway info'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.DATASOURCE.LIST, ex);
      reject(ex);
    }
  });
};


function installMqttEventTrigger(userId, datasourceId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {

      onem2mManager.subscribeToTriggerNode(userId, datasourceId, triggerInfo.resourcePath)

      .then(()=>{
        resolve(triggerInfo);
      })

      .catch((ex)=>{
        debug.log("EXCEPTION", ex);
        reject(ex);
      });
    }
    catch( ex ) {
      debug.log("EXCEPTION", ex);
      reject(ex);
    }
  });
}

function uninstallMqttEventTrigger(userId, datasourceId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {

      onem2mManager.unsubscribeToTriggerNode(userId, datasourceId, triggerInfo.resourcePath)

      .then(()=>{
        resolve(triggerInfo);
      })

      .catch((ex)=>{
        debug.log("EXCEPTION", ex);
        reject(ex);
      });
    }
    catch( ex ) {
      debug.log("EXCEPTION", ex);
      reject(ex);
    }
  });
}

function saveDatasourceCode(userId, datasourceId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {
      var subdir = datasourceId.substring(0, 3);
      var codeDirectory = path.join(SYSTEM_DIRECTORIES.code, subdir);
      var codeFullPath = path.join(codeDirectory, datasourceId + '.js');

      mkdirp(codeDirectory)
        .then(()=>{
          return new Promise(function(resolve, reject) {

            decache(codeFullPath);

            fs.writeFile(codeFullPath, triggerInfo.code, function(err) {
              if (err) reject(err);
              else resolve(true);
            });
          });
        })

        .then(()=>{
          resolve(triggerInfo);
        })
    }
    catch (ex) {
      debug.log("EXCEPTION", ex);
      reject(ex);
    }
  });
}

function installTrigger(userId, datasourceId, triggerInfo) {

  switch(triggerInfo.type) {
    case  'onem2m_trigger':
      return installMqttEventTrigger(userId, datasourceId, triggerInfo);

    default:
      return null;
  }
}


function uninstallTrigger(userId, datasourceId, triggerInfo) {

  switch(triggerInfo.type) {
    case  'onem2m_trigger':
      return uninstallMqttEventTrigger(userId, datasourceId, triggerInfo);

    default:
      return null;
  }
}


exports.runDatasource = (auth, datasourceId)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;
      var _datasourceDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if (userDoc) {
            _userDoc = userDoc;
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Invalid user info');
          }

          return DatasourcesModel.findDatasource(_userDoc, datasourceId);
        })

        .then((datasourceDoc)=>{
          _datasourceDoc = datasourceDoc;

          return saveDatasourceCode(auth.userId, datasourceId, _datasourceDoc.triggerInfo);
        })
        
        .then((triggerInfo)=>{

          return installTrigger(auth.userId, datasourceId, triggerInfo);
        
        })

        .then((triggerInfo)=>{
          _datasourceDoc.status = 'active';

          return _datasourceDoc.save();
        })


        .then((datasourceDoc)=>{

          //  send email for activation user account
          resolve(datasourceDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.DATASOURCE.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Fail to get gateway info'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.DATASOURCE.LIST, ex);
      reject(ex);
    }
  });
}


exports.stopDatasource = (auth, datasourceId)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;
      var _datasourceDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if (userDoc) {
            _userDoc = userDoc;
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Invalid user info');
          }

          return DatasourcesModel.findDatasource(_userDoc, datasourceId);
        })
        
        .then((datasourceDoc)=>{
          datasourceDoc.status = 'inactive';

          return datasourceDoc.save();
        
        })

        .then((datasourceDoc)=>{
          return uninstallTrigger(auth.userId, datasourceId, datasourceDoc.triggerInfo);

        })


        .then((datasourceDoc)=>{

          //  send email for activation user account
          resolve(datasourceDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.DATASOURCE.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.DATASOURCE.LIST, 'unknown', 'Fail to stop datasource'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.DATASOURCE.LIST, ex);
      reject(ex);
    }
  });
}
