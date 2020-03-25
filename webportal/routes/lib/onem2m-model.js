(function() {
  var exports, Promise, Http, Uuid, _ ;

  Promise = require("bluebird");
  Http = require('request-promise');
  Uuid = require('uuid');
  _ = require('underscore');

  exports = module.exports = {
    Resource: {
      getTypeCode: getTypeCode,
      getShortName: getShortName,
      getContentModel: getContentModel
    },
    GetResource: GetResource,
    randomString: randomString
  };



  var CONST_RESOURCE_TYPES = {
    "acp" : "1",
    "ae": "2",
    "cnt": "3",
    "cin": "4",
    "cb": "5",
    "grp": "9",
    "lcp": "10",
    // "mgo": "13",
    // "nod": "14,
    "csr": "16",
    // "req": "17,
    "sub": "23",
    "smd": "24",
    "ts": "25",
    "tsi": "26",
    "mms": "27",
    "rsp": "99",
    "sd": "24"
  };

  var CONTENT_MODEL = {
    "1": ["23"],  //  acp - sub
    "2": ["23", "3", "9", "1", "24", "25"],  //  ae - sub, container, group, acp, pollingChannel, schedule, semanticDesc, timeSeries
    "3": ["4", "23", "3", "24"],  // cnt - contentInstance, sub, contain, latest, oldest, semanticDesc,
    "4": ["24"],  // cin  - semanticDesc
    "5": ["2", "3", "9", "1", "23", "26"],  //  cb  - ae, container, group, acp, sub, timeseries
    "9": ["23", "24"],  //  grp  0 sub, semanticDesc
    "10": [], //  lcp
    "16": ["3", "9", "1", "23", "25"], //  csr   -- container, group, acp, subscription, timeseries
    "23": [], //  sub
    "24": ["23"], //  sd  - sub
    "25": ["26", "23", "24"], //  ts   - timeSeriesInstance, sub, semanticDesc
    "26": [], //  tsi
    "27": [], //  mms
    "99": []  //  rsp
  };


  function getTypeCode(typeName) {

    //  TODO thyun convert various type of resource type name, eg. long, short, qualified
    var shortName = typeName;
    var qualifierIndex = typeName.indexOf( ':' );
    if( qualifierIndex != -1 )
      shortName = typeName.substring(qualifierIndex+1);

    return CONST_RESOURCE_TYPES[shortName];

  }


  function getShortName(resource) {
    var shortName = _.keys(resource)[0];
    var qualifierIndex = shortName.indexOf( ':' );
    if( qualifierIndex != -1 )
      shortName = shortName.substring(qualifierIndex+1);

    return shortName;
  }


  function getContentModel(typeName) {
    var typeCode = getTypeCode(typeName);
    var conentModel = CONTENT_MODEL[typeCode];

    return conentModel;
  }


  function GetResource(baseUrl, resourcePath) {

    return new Promise(function(resolved, rejected) {
      var target = url.parse(baseUrl + '/' + resourcePath);

      var options = {
        method: 'GET',
        uri: baseUrl + '/' + resourcePath,
        headers: {
          "Accept": "application/json",
          "X-M2M-RI": Uuid.v4(),
          "X-M2M-Origin": "S0.2.481.1.1.232466"
        },
        json: true
      };

      Http(options)
        .then(function(result) {
          resolved(result);
        })
        .catch(function(error) {
          rejected(error);
        });
    });
  }


  function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }


}).call(this);

