
(function(){
  'use strict';

  angular
    .module('mobiusPortal')
    .service('otaService', OtaService);


  OtaService.$inject = ['$http', '$rootScope'];


  function OtaService($http, $rootScope) {

    var services = {
      "getVersion": _getVersion,
      "signup": _signup,
      "logout": _logout,
      "loginUser": _loginUser
    };
    return services;



    function _getVersion(aeName) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.OTA_BASE_URL + aeName + '/version',
            method: "GET",
            cache: false
          };

          $http(httpOptions)

          .then(function(response){

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _loginUser() {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + SERVICE_URL['loginUser'],
            method: "GET"
          };

          $http(httpOptions)

          .then(function(response){
            $rootScope.loginuser = response.data;

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _signup(username, email, password) {
      return new Promise(function(resolve, reject) {

        try {
          var body = {
            "username": username,
            "email": email,
            "password": password
          };

          var httpOptions = {
            url: window.API_BASE_URL + SERVICE_URL['signup'],
            method: "POST",
            data: body
          };

          $http(httpOptions)

            .then(function(response){
              resolve(response.data);
            })

            .catch(function(err){
              console.error(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _signup()


    function _logout() {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + SERVICE_URL['logout'],
            method: "POST"
          };

          $http(httpOptions)

            .then(function(response){
              $rootScope.loginuser = null;

              resolve(response.data);
            })

            .catch(function(err){
              console.error(err);
              $rootScope.loginuser = null;
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _logout()

  } //   end of function OtaService()
})();
