/*!
 * XogusTools.String(XString) v0.9.0 (http://)
 * Copyright 2016- Taehyun Kim.
 * Licensed under the MIT license
 */
(function(){

  'use strict';

  if( !window.OneM2M )
    window.OneM2M = {};

  

  function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }


  /**
   * [accessPoint description]
   * @param  {[type]} url [description]
   * @return {[type]}     [description]
   *
   * parse resource URL to get access point information
   *   assume that value of passed url is http://domain.name.of.mobius.server:port/mobius-yt/justin/container2?a=va&b=vb&c=vc
   *   result could consisted of 
   *     baseUrl : http://domain.name.of.mobius.server:port/
   *     cseName : mobus-yt
   *     resourcePath : /justin/container2
   *     query : a=va&b=vb&c=vc     
   */
  function getAccessPointInfo(url) {

    var uri = new URI(url);

    var protocol  = uri.protocol();
    var hostname  = uri.hostname();
    var port      = uri.port();
    var pathname  = uri.pathname();
    var query     = uri.query();

    var baseUrl = protocol + '://';
    baseUrl += hostname;
    if( port )
      baseUrl += ':' + port;

    var aryPath = [];
    if(pathname) {
      aryPath = pathname.split('/');
      aryPath.splice(0,1);
    }

    var cseName = '';
    if(aryPath.length > 0)
      cseName = aryPath[0];

    var aryQuery = [];
    if( query ) {
      var aryQueryItems = query.split( '&' );

      for(var i=0; aryQueryItems && i < aryQueryItems.length; i++) {
        var keyValue = aryQueryItems[i].split( '=' );
        var key = null, value = null;

        if( keyValue.length > 0 )
          key = keyValue[0].trim();

        if( key.length == 0 )
          continue;

        if( keyValue.length > 1 && keyValue[1].length > 0 )
          value = keyValue[1];

        if( key ) {
          var obj = new Object();
          obj[key] = value;

          aryQuery.push( obj );
        }
      }
    }

    return {
      baseUrl : baseUrl,
      path : pathname,
      aryPaths : aryPath,
      cseName : aryPath[0],
      queries: query,
      aryQueries : aryQuery
    }
    //  
  }

    
  var CONST_RESOURCE_TYPES = {
    "acp" : "1",
    "ae": "2",
    "cnt": "3",
    "cin": "4",
    "cb": "5",
    "grp": "9",
    "lcp": "10",
    //    "13": "mgo",
    //    "14": "nod",
    "csr": "16",
    //    "17": "req",
    "sub": "23",
    "sd": "24",
    "ts": "25",
    "tsi": "26",
    "mms": "27",
    "rsp": "99"
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

  function getContentModel(typeName) {
    var typeCode = getTypeCode(typeName);
    var conentModel = CONTENT_MODEL[typeCode];

    return conentModel;
  }
})();