/**
 * [description]
 *
 *  oneM2M protocol client 
 *
 *
 * 
 */
(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .service('onem2mService', Onem2mService);


  Onem2mService.$inject = ['$http', 'store'];

  var HTTP_REQUEST_JOB_QUEUE = [];
  function Onem2mService($http, store) {


    var services = {
      "getCB": getCB,
      "createResource": createResource,
      "deleteResource": deleteResource,
      "discoverResource": discoverResource,
      "getResource": getResource,
      "subscribeTo": subscribeTo,
      "unsubscribeFrom": unsubscribeFrom
    };


    startHttpRequestQueue();

    return services;





    function requestOverHttp(option, cbSuccess, cbError) {
      $http(option)
        .then(cbSuccess, cbError);

    }

    var runningJob = null;
    function startHttpRequestQueue() {
      setInterval(function(){

        if(runningJob)
          return;
        else
          runningJob = HTTP_REQUEST_JOB_QUEUE.shift();

        if(runningJob) {
          requestOverHttp(runningJob.option, function(res){
            runningJob.onSuccess(res);
            runningJob = null;
          }, function(err){
            runningJob.onError(err);
            runningJob = null;
          });
        }

        if(HTTP_REQUEST_JOB_QUEUE.length > 100 ) {
          //console.log( "JOB_QUEUE SIZE: " + HTTP_REQUEST_JOB_QUEUE.length);
        }
      }, 50);
    }




    function getResource(resourceUrl, origin) {

      return new Promise(function(resolve, reject) {
        var retval = null;

        var option = {
          url: window.API_BASE_URL + '/onem2m/',
          method: "GET",
          params: {
            "resourceUrl": resourceUrl,
            "origin": origin
          }
        };

        var onSuccess = function(response) {
          resolve(response.data);
        };

        var onError = function(response) {
          reject(response.data);
        }

        HTTP_REQUEST_JOB_QUEUE.push({
          option: option,
          onSuccess: onSuccess,
          onError: onError
        });
      });
    };

    function getResource_org(resourceUrl, origin) {

      return new Promise(function(resolve, reject) {
        var retval = null;

        $http({
          url: window.API_BASE_URL + '/onem2m/',
          method: "GET",
          params: {
            "resourceUrl": resourceUrl,
            "origin": origin
          }
        }).then(function (response) {
            retval = response.data;

            resolve(retval);

          }, function (response) {
            retval = response.statusText;
            reject(response.data);
          } );
      });
    };

    function discoverResource(resourceUrl, parentType, origin, type, limit, offset) {

      return new Promise(function(resolve, reject) {
        var retval = null;


        var params = {
          "parentType": parentType,
          "resourceUrl": resourceUrl,
          "origin": origin,
          "filterUsage": "1"
        };
        if( type ) params.type = type;
        if( limit ) params.limit = limit;
        if( offset ) params.offset = offset;

        var option = {
          url: window.API_BASE_URL + '/onem2m/',
          method: "GET",
          params: params
        };
        var onSuccess = function(response){
          resolve(response.data);
        };
        var onError = function(response) {
          reject(response.data);
        }

        HTTP_REQUEST_JOB_QUEUE.push({
          option: option,
          onSuccess: onSuccess,
          onError: onError
        });
      });
    };


    function createResource(parentResourceUrl, resource, origin) {

      return new Promise( function(resolve, reject) {
        var retval = null;

        $http({
          url: window.API_BASE_URL + '/onem2m/',
          method: 'POST',
          params: {
            "parentResourceUrl": parentResourceUrl,
            "origin": origin
          },
          data: resource
        }).then(function (response) {
            resolve(response.data);

          }, function (response) {
            console.log( ' fail to create resource ' );
            console.log( response.data );
            reject(response.data);
          } );
      });

    };

    function deleteResource(resourceUrl, origin) {

      return new Promise( function(resolve, reject) {
        var retval = null;

        $http({
          url: window.API_BASE_URL + '/onem2m/',
          method: 'DELETE',
          params: {
            "resourceUrl": resourceUrl,
            "origin": origin
          }
        }).then(function (response) {
            resolve(response.data);

          }, function (response) {
            console.log( ' fail to delete resource ' );
            console.log( response.data );
            reject(response.data);
          } );
      });
    }

    function subscribeTo(targetResourceUrl, subName, origin, mqttUrl) {
      return new Promise( function(resolve, reject) {
        var retval = null;

        var notificationUrl = mqttUrl;
        if(origin.startsWith('/'))
          notificationUrl += (origin + '?ct=json');
        else
          notificationUrl += ('/' + origin + '?ct=json');

        var resource = {
          'm2m:sub' : {
            'rn': subName,
            'enc': {
              'net': ['1', '2', '3', '4']
            },
            'nu': [notificationUrl],
            'nct': '1'
          }
        };

        var option = {
          url: window.API_BASE_URL + '/onem2m/',
          method: 'POST',
          params: {
            "parentResourceUrl": targetResourceUrl,
            "origin": origin
          },
          data: resource
        };
        var onSuccess = function(response){
          resolve(response.data);
        };
        var onError = function(response) {
          reject(response.data);
        }

        HTTP_REQUEST_JOB_QUEUE.push({
          option: option,
          onSuccess: onSuccess,
          onError: onError
        });

      });
    }

    function unsubscribeFrom(target, origin, mqttUrl) {
      return new Promise( function(resolve, reject) {
        var retval = null;

        var resourceName = _.keys(target)[0];
        var targetResource = target[resourceName];
        //  thkim unstructured ri 적용
        var parentResourceUrl = targetResource.pi + "/" + targetResource.rn;

        $http({
          url: window.API_BASE_URL + '/onem2m/',
          method: 'DELETE',
          params: {
            "parentResourceUrl": parentResourceUrl,
            "origin": origin
          }
        }).then(function (response) {
            resolve(response.data);

          }, function (response) {
            console.log( ' fail to create resource ' );
            console.log( response.data );
            reject(response.data);
          } );
      });
    }




    function getCB(baseUrl, path) {

      var retval = null;

      $http({
        url: window.API_BASE_URL + '/onem2m/',
        method: "GET",
        params: {
          "baseUrl": baseUrl,
          "resourcePath": path
        }
      }).then(function (response) {
          retval = response.data;

        }, function (response) {
          retval = response.statusText;
        } );

        return retval;

      };

    }





    function getCB2(url, cb) {

      var retval = null;

      $http({
        url: window.API_BASE_URL + '/onem2m/' + encodeURIComponent(url + '/' + cb),
        method: "GET",
        headers: {
          "Accept": "application/vnd.onem2m-prsp+xml", 
          "X-M2M-RI": "12345", 
          "X-M2M-Origin": "S0.2.481.1.1.232466" 
        }
      }).then(function (response) {
          retval = response.data;

        }, function (response) {
          retval = response.statusText;
        } );

      return retval;

    };





})();