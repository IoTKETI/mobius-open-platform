(function(serverAddress) {
  var exports, Promise, Mqtt, MqttClients, Uuid, _, util, debug, onem2mModel;

  Promise = require("bluebird");
  Mqtt = require('mqtt');
  Uuid = require('uuid');
  _ = require('underscore');
  util = require('util');
  debug = require('debug')('keti');

  onem2mModel = require('./onem2m-model.js');

  MqttClients = {};


  var MqttClient = function(mqttServerAddress, from) {
    var thisObj = this;
    thisObj.mqttServerAddress = mqttServerAddress;
    thisObj.from = from;
    thisObj.eventHandlers = [];


    thisObj.mqttClient = Mqtt.connect(mqttServerAddress);
    thisObj.mqttClient.on('connect', function () {
      mqttSubscribe(thisObj.mqttClient, from);
    });

    thisObj.mqttClient.on('message', mqttMessageHandler);


    function mqttSubscribe(mqttClient, origin) {
      /*
        SPEC: TS-0010-V2.4.1 MQTT Protocol Binding
      
        6.4.2 Sending a Request

        /oneM2M/req/<originator>/<receiver>/<type>

        - <receiver> is the SP-relative-AE-ID or SP-relative-CSE-ID of the Receiver (AE, Transit CSE or Hosting
  CSE) on this hop, omitting any leading
       
      */

      var aeTopicName = origin;
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

    function mqttMessageHandler(topic, message) {
      debug(topic + " :: " + message );

      //  mqtt req primitive param changed on Mobius 2.0
      var mesgObj = JSON.parse(message.toString());
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

      var primitiveContent = primitiveParameters['pc'];

      var sgn = primitiveContent['sgn'] || primitiveContent['m2m:sgn'];
      if(! sgn.vrq ) {
        var handler = thisObj.eventHandlers['notification'];
        if( handler ) {

          handler(thisObj.mqttServerAddress, primitiveContent);
        }
      }

      //  publish response
      var respObj = {
        'm2m:rsp': {
          'rsc': '2000',
          'to': '',
          'fr': thisObj.from,
          'rqi': reqId,
          'pc': ''
        }
      };

      var topicArray = topic.split('/');
      var id = topicArray[3];
      var aeId = topicArray[4];
      var respTopic = "/oneM2M/resp/" + id + "/" + aeId + "/json";
      thisObj.mqttClient.publish(respTopic, JSON.stringify(respObj));

    }
  };

  MqttClient.prototype.on = function(event, handler) {
    this.eventHandlers[event] = handler;
    debug( '')
  }

  MqttClient.prototype.off = function(event, handler) {
    if(this.eventHandlers[event])
      delete this.eventHandlers[event];
  }

  exports = module.exports = {
    getClient: getClient,
    Disconnect: Disconnect,
    Subscribe: Subscribe,
    Unsubscribe: Unsubscribe
  };


  function getClient(to, from) {

    if( !(from && to) )
      return null; 
    
    var mqttServerAddress = '';

    if( to.startsWith('mqtt://') )
      mqttServerAddress = to;
    else
      mqttServerAddress = 'mqtt://' + to;

    if( ! MqttClients[mqttServerAddress] ) {
      MqttClients[mqttServerAddress] = new MqttClient(mqttServerAddress, from);
    }

    return MqttClients[mqttServerAddress];
  }



  function Disconnect(from) {

  }

  function Subscribe(topic) {

  }

  function Unsubscribe(topic) {

  }

  function GetResource(resourceUrl, origin) {

    debug( 'GetResource is called with url: ' + resourceUrl + ', origin: ' + origin);
    return new Promise(function(resolved, rejected) {

      var options = {
        method: 'GET',
        uri: resourceUrl,
        headers: {
          "Accept": "application/json", 
          "nmtype": "short",
          "X-M2M-RI": Uuid.v4(),
          "X-M2M-Origin": origin
        },
        json: true
      };  

      Http(options)
        .then(function(result) {
          debug( 'success to get resource information ' + result );
          resolved(result);
        })
        .catch(function(error) {
          debug( 'fail to get resource information ' + error );
          rejected(error);
        });
    });
  }

  function DiscoverResource(resourceUrl, origin, type) {

    debug( 'DiscoverResource is called with url: ' + resourceUrl + ', origin: ' + origin + ', type: ' + type);
    return new Promise(function(resolved, rejected) {

      var filterCriteria = '?fu=1';
      if( type ) {
        var resourceTypeCode = onem2mModel.Resource.getTypeCode(type); 
        if( resourceTypeCode )
          filterCriteria += '&ty=' + resourceTypeCode;
      }

      var options = {
        method: 'GET',
        uri: resourceUrl + filterCriteria,
        headers: {
          "Accept": "application/json", 
          "nmtype": "short",
          "X-M2M-RI": Uuid.v4(),
          "X-M2M-Origin": origin
        },
        json: true
      };  

      Http(options)
        .then(function(result) {
          debug( 'success to discover resource information ' + result );
          resolved(result);
        })
        .catch(function(error) {
          debug( 'fail to discover resource information ' + error );
          rejected(error);
        });
    });
  }

  function CreateResource(parentResourceUrl, resource, origin) {

    debug( 'CreateResource is called with parentResourceUrl: ' + parentResourceUrl + ', resource: ' + resource + ', origin: ' + origin);

    return new Promise(function(resolved, rejected) {

      var resourceType = _.keys(resource)[0];
      var resourceTypeCode = onem2mModel.Resource.getTypeCode(resourceType); 

      var options = {
        method: 'POST',
        uri: parentResourceUrl,
        headers: {
          "Accept": "application/json", 
          "Content-Type": "application/vnd.onem2m-res+json;ty="+resourceTypeCode,
          "X-M2M-RI": Uuid.v4(),
          "X-M2M-Origin": origin
        },
        body: resource,
        json: true
      };  

      Http(options)
        .then(function(result) {
          debug( 'success to create resource ' + result );
          resolved(result);
        })
        .catch(function(error) {
          debug( 'fail to create resource ' );
          debug( error.message );
          rejected(error);
        });
    });
  }


}).call(this);
