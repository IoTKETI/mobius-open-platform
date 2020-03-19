const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp-promise');
const decache = require('decache');

const PlatformError = require('./error.manager.js');
const onem2mManager = require('./onem2m.manager.js');
const mobiusDatasyncManager = require('./mobius.datasync.manager.js');
const UserModel  = require('../models/user.model.js');
const WidgetsModel  = require('../models/widgets.model.js');
const DatasourceModel  = require('../models/datasource.model.js');

const debug = global.debug;
const SYSTEM_DIRECTORIES = global.CONFIG.directories;

exports.triggerResource = (auth, triggerInfo)=> {
  return new Promise((resolve, reject)=>{
    onem2mManager.createContentInstance(auth.userId, triggerInfo.path, triggerInfo.data)
      .then(()=>{
        resolve(true);
      })

      .catch((err)=>{
        debug.log( 'ERROR', err);
      })
  });
}

exports.createWidget = (auth, widgetInfo)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;
      var _widgetDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.createWidget(userDoc, widgetInfo);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetDoc)=>{
          _widgetDoc = widgetDoc;
          if(widgetInfo.triggerInfo) {
            return updateTriggerInfo(_userDoc.userId, widgetDoc, widgetInfo.triggerInfo, true);
          }
          else {
            return null;
          }
        })

        .then((triggerInfo)=>{
          resolve(_widgetDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to create widget'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
}

exports.deleteWidget = (auth, widgetId)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;
      var _widgetDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;
            return WidgetsModel.findOne({owner: userDoc._id, widgetId: widgetId});
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetDoc)=>{
          _widgetDoc = widgetDoc;

          return uninstallTrigger(_userDoc.userId, widgetDoc.widgetId, widgetDoc.triggerInfo);
        })

        .then((triggerInfo)=>{
          return WidgetsModel.deleteWidget(_userDoc, _widgetDoc.widgetId);

        })

        .then((widgetDoc)=>{
          resolve(_widgetDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to delete widget'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
}

exports.listWidgets = (auth)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.listWidgets(userDoc);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetListDoc)=>{

          //  send email for activation user account
          resolve(widgetListDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to get gateway info'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
};

exports.getWidget = (auth, widgetId)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.getWidget(userDoc, widgetId);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetDoc)=>{

          //  send email for activation user account
          resolve(widgetDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to get gateway info'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
};

exports.listWidgets = (auth)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.listWidgets(userDoc);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetListDoc)=>{

          //  send email for activation user account
          resolve(widgetListDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to get gateway info'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
};

exports.updateWidget = (userId, widgetId, updateData)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      UserModel.findOneByUserId(userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.findOne({owner: userDoc._id, widgetId: widgetId});
          }

          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetDoc)=>{
          return updateTriggerInfo(_userDoc.userId, widgetDoc, updateData.triggerInfo);
        })


        .then((widgetDoc)=> {

          _.extend(widgetDoc, updateData);
          return widgetDoc.save();
        })

        .then((widgetDoc)=>{
          resolve(widgetDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to update widget'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
};

exports.updateWidgetOrder = (auth, widgetIdList)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      UserModel.findOneByUserId(auth.userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.updateWidgetOrder(userDoc, widgetIdList);
          }

          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetIdList)=>{
          resolve(widgetIdList);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to update widget order'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
};


exports.updateWidgetData = (userId, widgetId, widgetData)=> {

  return new Promise((resolve, reject)=>{

    try {
      var _userDoc = null;

      //  find user
      UserModel.findOneByUserId(userId)
        .then((userDoc)=> {
          if(userDoc) {
            _userDoc = userDoc;

            return WidgetsModel.updateWidgetData(userDoc, widgetId, widgetData);
          }
          else {
            throw new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Invalid user info');
          }
        })

        .then((widgetDoc)=> {

          resolve(widgetDoc);
        })

        .catch((err)=>{
          debug.log("ERROR:", PlatformError.SOURCE.WIDGET.LIST, err);
          if(err instanceof PlatformError)
            return reject(err);
          else
            return reject(new PlatformError(PlatformError.SOURCE.WIDGET.LIST, 'unknown', 'Fail to update widget data'));
        });
    }
    catch(ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.WIDGET.LIST, ex);
      reject(ex);
    }
  });
};

function compareTriggerInfo(a, b) {
  //  reference가 동일하면 동일 
  if(a == b)
    return true;

  //  둘중에 하나라도 null이면 다르게 취급
  if(!a || !b)
    return false;

  //  둘중에 하나라도 "type"이 없으면 다르게 취급
  if(!a.type || !b.type)
    return false;
  
  //  모두 "type"이 있고, 다른 값이면 다르게 취급 
  if(a.type != b.type)
    return false;

  switch(a.type) {
    case  'onem2m_trigger':
      if(a.resourcePath == b.resourcePath)
        return true;
      else 
        return false;

  }

  return true;
}


function saveDatasourceCode(widdgetId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {
      var subdir = widdgetId.substring(0, 3);
      var codeDirectory = path.join(SYSTEM_DIRECTORIES.code, subdir);
      var codeFullPath = path.join(codeDirectory, widdgetId + '.js');

      if(triggerInfo == null) {
        return resolve(triggerInfo);
      }
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

function removeDatasourceCode(widdgetId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {
      var subdir = widdgetId.substring(0, 3);
      var codeDirectory = path.join(SYSTEM_DIRECTORIES.code, subdir);
      var codeFullPath = path.join(codeDirectory, widdgetId + '.js');


      decache(codeFullPath);
      fs.unlinkSync(codeFullPath);
      fs.rmdirSync(codeDirectory);

  
      resolve(triggerInfo);
    }
    catch (ex) {
      debug.log("EXCEPTION", ex);
      resolve(triggerInfo);
    }
  });
}


function updateTriggerInfo(userId, widgetDoc, triggerInfo, forceInstall) {
  //  code 저장

  return new Promise((resolve, reject)=>{
    try {

      saveDatasourceCode(widgetDoc.widgetId, triggerInfo)
      .then(()=>{
        if( !compareTriggerInfo(widgetDoc.triggerInfo, triggerInfo)) {
          //  다르면 기존거 삭제 
          return uninstallTrigger(userId, widgetDoc.widgetId, widgetDoc.triggerInfo);
        }
        else {
          return null;
        }
      })

      .then((result)=>{
        if(forceInstall || result != null) {
          return installTrigger(userId, widgetDoc.widgetId, triggerInfo);
        }
        else {
          return null;
        }
      })

      .then((result)=>{
        resolve(widgetDoc);
      })

    }
    catch(ex) {
      reject(ex);
    }
  });


}

function installTrigger(userId, widgetId, triggerInfo) {

  if(!triggerInfo)
    return null;

  switch(triggerInfo.type) {
    case  'onem2m_trigger':
      return installMqttEventTrigger(userId, widgetId, triggerInfo);

    default:
      return null;
  }
}


function uninstallTrigger(userId, widgetId, triggerInfo) {

  if(!triggerInfo)
    return true;

  switch(triggerInfo.type) {
    case  'onem2m_trigger':
      return uninstallMqttEventTrigger(userId, widgetId, triggerInfo);

    default:
      return null;
  }
}



function installMqttEventTrigger(userId, widgetId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {

      console.log('subscribeToTriggerNode', triggerInfo.resourcePath);
      onem2mManager.subscribeToTriggerNode(userId, widgetId, triggerInfo.resourcePath)

      .then(()=>{
        return saveDatasourceCode(widgetId, triggerInfo);
      })

      .then(()=>{
        return onem2mManager.retrieveLatestContentInstance(userId, triggerInfo.resourcePath);
      })

      .then((latestCin)=>{
        if(latestCin && latestCin['m2m:cin'] && latestCin['m2m:cin']['con'] ) {
          return mobiusDatasyncManager.triggerWidget(userId, widgetId, latestCin['m2m:cin']['con']);
        }
        else {
          return null;
        }
      })

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

function uninstallMqttEventTrigger(userId, widgetId, triggerInfo) {
  return new Promise((resolve, reject)=>{
    try {

      console.log('unsubscribeToTriggerNode', triggerInfo.resourcePath);
      onem2mManager.unsubscribeToTriggerNode(userId, widgetId, triggerInfo.resourcePath)

      .then((triggerInfo)=>{
        return removeDatasourceCode(widgetId, triggerInfo);
      })

      .then((triggerInfo)=>{
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