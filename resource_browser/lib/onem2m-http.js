(function() {
  var exports, Promise, Http, Uuid, _, debug, onem2mModel;

  Promise = require("bluebird");
  Http = require('request-promise');
  Uuid = require('uuid');
  _ = require('underscore');
  debug = require('debug')('keti');

  onem2mModel = require('./onem2m-model.js');

  exports = module.exports = {
    GetResource: GetResource,
    DiscoverResource: DiscoverResource,
    DiscoverDirectChildResource: DiscoverDirectChildResource,
    DiscoverChildInstance: DiscoverChildInstance,
    CreateResource: CreateResource,
    DeleteResource: DeleteResource
  };


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

  function DiscoverResource(resourceUrl, origin, type, limit, offset) {

    debug( 'DiscoverResource is called with url: ' + resourceUrl + ', origin: ' + origin + ', type: ' + type + ', limit: ' + limit);
    return new Promise(function(resolved, rejected) {

      var filterCriteria = '?fu=1';
      if( type ) {
        filterCriteria += '&ty=' + type;
      }
      if( limit ) {
        filterCriteria += '&lim=' + limit;
      }
      else if (type == '4' || type == '26') {    //  contentInstance or timeseriseInstance 인 경우 limit를 5로 제한 
        filterCriteria += '&lim=' + 1;
      }
      if( offset ) {
        filterCriteria += '&ofst=' + offset;
      }

      filterCriteria += '&lvl=1';

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

      debug( "DISCOVER : " + resourceUrl + filterCriteria);
      Http(options)
        .then(function(result) {
          debug( 'success to discover resource('+type+') information ' + result['m2m:uril'] );
          resolved(result);
        })
        .catch(function(error) {
          debug( 'fail to discover resource('+type+') information ' + error );
          rejected(error);
        });
    });
  }


  function DiscoverDirectChildResource(resourceUrl, origin, contentModel) {

    debug( 'DiscoverDirectChildResource is called with url: ' + resourceUrl + ', origin: ' + origin + ', contentModel: ' + contentModel );
    return new Promise(function(resolved, rejected) {

      var needGetCin = false;
      var filterCriteria = '?rcn=4&lvl=1';
      contentModel.map(function(item){
        if(item=='4') { //  cin
          needGetCin = true;
        }
        else {
          filterCriteria += ('&ty=' + item);
        }
      });


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

      debug( "DISCOVER : " + resourceUrl + filterCriteria);
      Http(options)
        .then(function(result) {
          resolved(result);
        })
        .catch(function(error) {
          rejected(error);
        });
    });
  }


  function DiscoverChildInstance(resourceUrl, origin, type, limit) {

    debug( 'DiscoverDirectChildResource is called with url: ' + resourceUrl + ', origin: ' + origin + ', type: ' + type + ', limit: ' + limit );
    return new Promise(function(resolved, rejected) {

      var needGetCin = false;
      var filterCriteria = '?rcn=4&lvl=1';
      filterCriteria += ('&ty=' + type);
      filterCriteria += ('&la=' + limit);

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

      debug( "DISCOVER : " + resourceUrl + filterCriteria);
      Http(options)
        .then(function(result) {
          resolved(result);
        })
        .catch(function(error) {
          rejected(error);
        });
    });
  }


  function DeleteResource(resourceUrl, origin) {

    debug( 'DeleteResource is called with url: ' + resourceUrl + ', origin: ' + origin);
    return new Promise(function(resolved, rejected) {

      var options = {
        method: 'DELETE',
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
          debug( 'success to delete resource information ' + result );
          resolved(result);
        })
        .catch(function(error) {
          debug( 'fail to delete resource information ' + error );
          rejected(error);
        });
    });
  }


  function CreateResource(parentResourceUrl, resource, origin) {

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

