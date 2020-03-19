const _ = require('lodash');
const path = require('path');

const PlatformError = require('./error.manager.js');
const debug = global.debug;
const SYSTEM_DIRECTORIES = global.CONFIG.directories;


var onem2mClient = require('../libs/onem2m-client.js');
var m2mManager = require('./onem2m.manager.js');

var widgetManager = require('./widget.manager.js');

var DASHBOARD_USER_AE_PREFIX = "DSHBD_";
var DASHBOARD_TRIGGER_SUB_PREFIX = "DSHBD_SUB";





function _mqttNotificationHandler(mqttAddress, from, topicParams, notiEventType, primitiveContent){
  var that = this;

  try {
    var sgn = primitiveContent['sgn'] || primitiveContent['m2m:sgn'];
    if(sgn.vrq)
      return true;

    //  from의 값이 DASHBOARD_TRIGGER_SUB_PREFIX 인 경우에만 처리
    if(from !== DASHBOARD_TRIGGER_SUB_PREFIX) {
      return false;
    }

    var userId = topicParams[0];
    if(!userId.startsWith(DASHBOARD_USER_AE_PREFIX))
      return false;

    userId = userId.substring(DASHBOARD_USER_AE_PREFIX.length);

    var widgetId = topicParams[1];

    var representation = sgn.nev.rep;
    var notiEventType = sgn.net||sgn.nev.net;
    var resourceType = _.keys(representation)[0];
    var sdResourceUrl = sgn.sur;
    var resource = sgn.nev.rep[resourceType];


    var resourceTypeCode = onem2mClient.Model.Resource.getTypeCode(resourceType)

    switch( notiEventType+'' ) {
      case '1' :  //  update of resource
        break;

      case '2' :  //  delete of resource
        break;

      case '3' :  //  create of direct child resource

        //  parent의 resource ID(ri)
        var parentId = resource['spi'] ? resource['spi'] : resource['pi'];
        var arySubResourceUrl = sdResourceUrl.split('/');

        //  SUB-NAME
        var subName = arySubResourceUrl[arySubResourceUrl.length-1];
        arySubResourceUrl.splice(arySubResourceUrl.length-1, 1);
        //  CONTAINER의 resourcePath (  /{ae-name}/{cnt-name}
        var parentPath = '/' + arySubResourceUrl.join('/');


        //  container가 추가된 경우
        if( resourceTypeCode == '3' ) {
          //  parent가 DASHBOARD_ZWAVE_THINGS_CONTAINER 인 경우
          //  TODO : Sub만 추가
          m2mManager.subscribeToZWaveThings(arySubResourceUrl[1], resource['rn'], userId)
            .then(()=>{});
        }

        //  contentInstance가 추가된 경우
        else if( resourceTypeCode == '4' ) {
          _triggerWidget(userId, widgetId, resource['con']);

        }

        break;

      case '4' :  //  delete of direct child resource
        break;
    }


    return true;
  }
  catch( e ) {
    debug.log( 'ERROR: while process MQTT notification message' );
    debug.log( e );
    debug.log( primitiveContent );
  }

}



function _startSync() {
  m2mManager.addMobiusListener(_mqttNotificationHandler);
}

function _triggerWidget(userId, widgetId, data) {

  var subdir = widgetId.substring(0, 3);
  var codeFullPath = path.join(process.cwd(), SYSTEM_DIRECTORIES.code, subdir, widgetId + '.js');

  try {
    var loadedModule = null;
    try {
      loadedModule = require.resolve(codeFullPath)
      delete require.cache[loadedModule];
    }
    catch(ex) {
      loadedModule = null;
    }

    var triggerFunctions = require(codeFullPath);
    
    var dataset = null;
    dataset =  triggerFunctions(widgetId, data);

  } catch(ex) {
    debug.log("IGNORABLE", ex);
    return;
  }


  widgetManager.updateWidgetData(userId, widgetId, dataset)
    .then((widgetData)=> {

      var pushData = {
        widgetId: widgetId,
        widgetData: dataset
      };

      pushMessageManager.sendPushMessage(userId, 'widgetdata.updated', pushData);
    })

    .catch((ex)=>{
      debug.log("EXCEPTION", ex);
    });

}


/*
 * Expose 'Mobius data sync manager'
  */
module.exports.startSync = _startSync;
module.exports.triggerWidget = _triggerWidget;
