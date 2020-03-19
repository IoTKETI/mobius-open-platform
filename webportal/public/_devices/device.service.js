
(function(){
  'use strict';

  angular
    .module('mobiusPortal')
    .service('deviceService', DeviceService);


  DeviceService.$inject = ['$http', '$state', 'authService'];

  function DeviceService($http, $state, authService) {

    var services = {
      "list": _list,
      "favorite": _favorite,
      "browse": _browse,
      "findAeResource": _findAeResource,
      "addNewDevice": _addNewDevice,
      "unregisterDevice": _unregisterDevice,
      "deleteDeviceResource": _deleteDeviceResource,
      "getDeviceInfo": _getDeviceInfo,
      "saveDeviceInfo": _saveDeviceInfo,
      "updateDeviceAcpi": _updateDeviceAcpi,
      "deleteDeviceAcpi": _deleteDeviceAcpi
    };
    return services;


    function _checkLogin(err) {
      if(err.status == 401) {

        $state.go('login');

        return true;
      }

      return false;
    }


    function _list(userId) {
      return new Promise(function(resolve, reject) {



        try {

          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device',
              method: "GET"
            };
  
            return $http(httpOptions)
          })       
          .then(function(response){
            resolve(response.data);
          })
          .catch(function(err){
            console.error(err.data);
            reject(err);
          })
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _list()


    function _favorite() {
      return new Promise(function(resolve, reject){
        try {
          var favoriteList = [
            {
              resourceType: "cb",
              resourceName: "Mobius",
              resourcePath: "/Mobius"
            },
            {
              resourceType: "cnt",
              resourceName: "ss",
              resourcePath: "/Mobius/justin/ss"
            }
          ];



          resolve(favoriteList);

        }
        catch( ex ) {
          debug(ex);
          reject(ex);
        }
      });
    } //  end of function _favorite()


    function _browse(resourceId, resourceName) {
      return new Promise(function(resolve, reject) {

        var params = {
          "resourceId": resourceId
        };

        try {
          authService.getAccessToken()
          .then(function(acToken){
      
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/onem2m/browse',
              method: "GET",
              params: params
            };            
            return $http(httpOptions)
          })     
          .then(function (response) {
            resolve({
              "resourceId": resourceId,
              "resourceName": resourceName,
              "resources": response.data
            });
          })
          .catch(function (err) {
            console.error(err.data);
            reject(err);
          })
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }
      })
    } //  end of function _browse()


    function _findAeResource(aeName, aeId) {
      return new Promise(function(resolve, reject) {

        var params = {
          aeName: aeName,
          aeId: aeId
        };

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/onem2m/findae',
              method: "GET",
              params: params
            };
            return $http(httpOptions)
          })           
          .then(function (response) {

            resolve(response.data);
          })
          .catch(function (err) {

            if( _checkLogin(err) )
              return true;

            console.error(err.data);
            reject(err);
          });
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }
      })
    } //  end of function _findAeResource()

    function _getDeviceInfo(deviceId) {
      return new Promise(function(resolve, reject){
        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device/' + deviceId,
              method: "GET"
            };
            return $http(httpOptions)
          })           
          .then(function(response){
            resolve(response.data);
          })
          .catch(function(err){
            if( _checkLogin(err) )
              return true;

            console.error(err.data);
            reject(err);
          });
        }
        catch(ex) {
          console.error( ex );
          reject(ex);
        }
      });
    } //  end of _loadDeviceInfo function

    function _saveDeviceInfo(deviceId, deviceInfo) {
      return new Promise(function(resolve, reject){
        try {
          authService.getAccessToken()
          .then(function(acToken){         
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device/' + deviceId,
              method: "PUT",
              data: deviceInfo
            };
            return $http(httpOptions)
          })  
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              if( _checkLogin(err) )
                return true;

              console.error(err.data);
              reject(err);
            });
        }
        catch(ex) {
          console.error( ex );
          reject(ex);
        }
      });
    } //  end of _loadDeviceInfo function

    function _addNewDevice(device) {
      return new Promise(function(resolve, reject) {

        try {
          var body = device;
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device',
              method: "POST",
              data: body
            };
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              if( _checkLogin(err) )
                return true;

              console.error(err.data);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of _addNewDevice function

    function _unregisterDevice(deviceId) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device/' + deviceId,
              method: "DELETE"
            };
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              if( _checkLogin(err) )
                return true;

              console.error(err.data);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of _addNewDevice function

    function _deleteDeviceResource(deviceId) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device/' + deviceId + '/resource',
              method: "DELETE"
            };
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              if( _checkLogin(err) )
                return true;

              console.error(err.data);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of _addNewDevice function

    function _updateDeviceAcpi(deviceId, acpi) {
      return new Promise(function(resolve, reject) {

        try {
          var body = acpi;
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device/' + deviceId + '/acpi',
              method: "PUT",
              data: body
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              if( _checkLogin(err) )
                return true;

              console.error(err.data);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of _updateDeviceAcpi function


    function _deleteDeviceAcpi(deviceId, acpi) {
      return new Promise(function(resolve, reject) {

        try {
          var body = [acpi];
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/device/' + deviceId + '/acpi',
              method: "DELETE",
              data: body,
              headers: {
                "Content-Type": "application/json;charset=utf-8"
              }
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              if( _checkLogin(err) )
                return true;

              console.error(err.data);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of _updateDeviceAcpi function

  } //   end of function DeviceService()
})();
