var debug = require('debug')('keti');
var onem2mClient = require('../lib/onem2m-client');
var mqtt = require('mqtt');
var util = require('util');
var onem2mMqtt = require('../lib/onem2m-mqtt');
var _ = require('underscore');

var Websocket = function(io) {
  var thisSocket = this;
  thisSocket.io = io;
  thisSocket.joinPaths = [];

  io.on('connection', function(socket) {
    socket.emit('connected', {});


    socket.on('start', function(data) {
      debug( "socket on start  " );
      debug( data );





      //  TODO 이 아랫 부분을 class로 만들어서.. Map으로 관리할 수 있도록 수정 
      //  


      var mqttAddress = data.to;
      if( mqttAddress.startsWith( 'mqtt://' ) ) {
        mqttAddress = data.to;
      }
      else {
        mqttAddress = 'mqtt://' + data.to;
      }

      socket.join( mqttAddress + data.path + '/' );
      if( -1 == thisSocket.joinPaths.indexOf(mqttAddress + data.path) ) {
        thisSocket.joinPaths.push(mqttAddress + data.path + '/');  //  이름이 유사한 다른 resource로 noti 되는 오류 수정 
      }


      var mqttClient = onem2mMqtt.getClient(mqttAddress, data.aeId);
      mqttClient.on('notification', function(mqttAddress, primitiveContent){
        try {
          var sgn = primitiveContent['sgn'] || primitiveContent['m2m:sgn'];
          var representation = sgn.nev.rep;
          var resourceType = _.keys(representation)[0];
          var resourcePath = sgn.sur;
          var notiEventType = sgn.nev.net;

          var fullPath = mqttAddress + '/' + resourcePath.removeLeadingSlash() + '/';  //  이름이 유사한 다른 resource로 noti 되는 오류 수정 

          debug( "mqttClient.on notification: " + fullPath);
          for(var i=0; i < thisSocket.joinPaths.length; i++) {
            if( fullPath.startsWith(thisSocket.joinPaths[i]) ) {
              debug( "send mqtt:notification: " + thisSocket.joinPaths[i] );
              var s = io.sockets.in(thisSocket.joinPaths[i]);
              s.emit('mqtt:notification', {notiEventType: notiEventType, primitiveContent: primitiveContent});

              break;
            }

            if(i >= thisSocket.joinPaths.length) {
              debug( fullPath );
            }
          }
        }
        catch( e ) {
          debug( 'ERROR: while process MQTT notification message' );
          debug( e );
          debug( primitiveContent );
        }

      });

    });


    socket.on('stop', function(data) {
      var mqttAddress = data.to;
      if( mqttAddress.startsWith( 'mqtt://' ) ) {
        mqttAddress = data.to;
      }
      else {
        mqttAddress = 'mqtt://' + data.to;
      }

      socket.leave( mqttAddress + data.path );
    });


  });

  function mqttSubscribe(mqttClient, aeId) {

    /*
      SPEC: TS-0010-V2.4.1 MQTT Protocol Binding
    
      6.4.2 Sending a Request

      /oneM2M/req/<originator>/<receiver>/<type>

      - <receiver> is the SP-relative-AE-ID or SP-relative-CSE-ID of the Receiver (AE, Transit CSE or Hosting
CSE) on this hop, omitting any leading
     
    */

    var aeTopicName = aeId;
    //  if SP-relative-AE-ID or SP-relative-CSE-ID
    if( aeTopicName.startsWith("/") ) {
      aeTopicName = aeTopicName.substring(1);
    }
    aeTopicName = aeTopicName.replace('/', ':');


    //  subscribe onem2m requet topic
    var reqTopic = util.format('/oneM2M/req/+/%s/#', aeTopicName);
    debug( 'SUBSCRIBE MQTT : ' + reqTopic );
    mqttClient.subscribe(reqTopic);
  }

  function mqttMessageHandler(topic, message, args) {
    debug(topic + " :: " + message + " .. " + JSON.stringify(args) );

  }
}

module.exports = Websocket;
