
(function(){
  'use strict';

  angular
    .module('mobiusPortal')
    .service('acpService', AcpService);


  AcpService.$inject = ['$http', '$state', 'authService'];

  function AcpService($http, $state, authService) {

    var services = {
      "list": _list,
      "createAcp": _createAcp,
      "addAcrule": _addAcrule,
      "deleteAcrule": _deleteAcrule,
      "updateAcrule": _updateAcrule,
      "getUsersName": _getUsersName
    };
    return services;


    function _getUsersName(emails) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              url: window.API_BASE_URL + '/acp/usersname',
              method: "GET",
              headers: {
                'ocean-ac-token' : acToken,
                "Content-Type": "application/json;charset=utf-8"
              },
              params: {
                emails: emails
              }
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
    }

    function _list(userId) {

      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              url: window.API_BASE_URL + '/acp',
              headers: {
                'ocean-ac-token' : acToken
              },
              method: "GET"
            };
  
            return $http(httpOptions)
          })
          .then(function(response){

            var acpList = response.data;

            resolve(acpList);
          })
          .catch(function(err){
            console.error(err.data);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _list()


    function _createAcp(acpObj) {
      return new Promise(function (resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              url: window.API_BASE_URL + '/acp',
              headers: {
                'ocean-ac-token' : acToken
              },
              method: "POST",
              data: acpObj
            };

            return $http(httpOptions)
          })
            .then(function (response) {
              resolve(response.data);
            }, function (err) {
              console.error(err.data);
              reject(err);
            });
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _createAcp()

    function _addAcrule(acp, rule) {
      return new Promise(function (resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              url: window.API_BASE_URL + '/acp/' + acp.rn + '/rule',
              headers: {
                'ocean-ac-token' : acToken
              },
              method: "POST",
              data: rule
            };

            return $http(httpOptions)
          })
            .then(function (response) {
              resolve(response.data);
            })
            .catch(function (err) {
              console.error(err.data);
              reject(err);
            });
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _addAcrule()


    function _deleteAcrule(acp, index) {
      return new Promise(function (resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              url: window.API_BASE_URL + '/acp/' + acp.rn + '/rule/' + index,
              headers: {
                'ocean-ac-token' : acToken
              },
              method: "DELETE"
            };

            return $http(httpOptions)
          })
            .then(function (response) {
              resolve(response.data);
            }) 
            .catch(function (err) {
              console.error(err.data);
              reject(err);
            });
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _deleteAcrule()

    function _updateAcrule(acp, index, acop) {
      return new Promise(function (resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              url: window.API_BASE_URL + '/acp/' + acp.rn + '/rule/' + index,
              headers: {
                'ocean-ac-token' : acToken
              },
              method: "PUT",
              data: {acop: acop}
            };

            return $http(httpOptions)
          })
          .then(function (response) {
              resolve(response.data);
          })
          .catch(function (err) {
            console.error(err.data);
            reject(err);
          });
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _updateAcprule()

    function _revokeAccessRights(acp, user) {
      return new Promise(function (resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/acp/' + acp.rn + '/rule/' + user.email,
            method: "DELETE"
          };

          $http(httpOptions)

            .then(function (response) {
              resolve(response.data);
            }, function (err) {
              console.error(err.data);
              reject(err);
            });
        }
        catch (ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _revokeAccessRights()

  } //   end of function AcpService()
})();
