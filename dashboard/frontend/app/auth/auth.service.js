
(function(){
  'use strict';

  angular
    .module('dashboard')
    .service('authService', AuthService);


  AuthService.$inject = ['$http', '$state', '$rootScope', '$window', 'notificationService', '$cookies'];

  var MIN_PASSWORD_LENGTH = 8;

  function AuthService($http, $state, $rootScope, $window, notificationService, $cookies) {

    var services = {
      "getLoginUser": _getLoginUser,
      "getAuthToken": _getAuthToken,

      "login": _login,
      "signup": _signup,
      "logout": _logout,

      "resetPassword": _resetPassword,
      "changePassword": _changePassword,
      "reIssueToken" : _reIssueToken,
      "getAccessToken" : _getAccessToken
    };
    return services;


    function _getLoginUser() {
      return new Promise(function(resolve, reject){
        _getAccessToken()
          .then(function(authToken){
            if(authToken) {
              resolve(jwt_decode(authToken));
            }
            else {
              $window.location.href=($rootScope.serverUrl+"/#!/login");
              reject(err);
            }
          })
          .catch(function(err){
            reject(err);
          })
      })
    }

    function _getAuthToken(doNotForward) {

      return new Promise(function(resolve, reject){
        _getAccessToken()
        .then(function(authToken){
          if(authToken) {
            resolve(authToken);
          }
          else if(doNotForward){
            $window.location.href=($rootScope.serverUrl+"/#!/login");
            reject();
          }
        })
        .catch(function(err){
          notificationService.showErrorMessage(err, true);
          reject(err);
        })
      })
    }

    function _login(userId, password, type) {
      return new Promise(function(resolve, reject) {

        try {
          var body = {
            "userId": userId,
            "password": password,
            "type": type
          };

          var httpOptions = {
            url: window.API_BASE_URL + "/auth/token",
            method: "POST",
            data: body
          };

          $http(httpOptions)

          .then(function(response){
            $cookies.set('ocean-ac-token', response.data.token);

            var userId = jwt_decode(response.data.token).userId;

            if(window.SOCKET)
              window.SOCKET.close();

            window.SOCKET = io.connect();
            window.SOCKET.on('connected', function (data) {

              window.SOCKET.emit('start', {userId: userId});
            });
            window.SOCKET.on('dashboard.push', function(data){
              notificationService.pushHandler(data);
            });

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            notificationService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()

    function _resetPassword(userId) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + "/auth/password/reset",
            method: "POST",
            data: {userId : userId}
          };

          $http(httpOptions)

          .then(function(response){

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            notificationService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _changePassword(token, password, password2) {
      return new Promise(function(resolve, reject) {

        var data = {
          token: token,
          password: password,
          password2: password2
        };

        try {
          var httpOptions = {
            url: window.API_BASE_URL + "/auth/password",
            method: "PUT",
            data: data
          };

          $http(httpOptions)

          .then(function(response){
            $cookies.remove('ocean-ac-token');

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            notificationService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _signup(userName, userId, password) {
      return new Promise(function(resolve, reject) {

        try {
          var body = {
            "userName": userName,
            "userId": userId,
            "password": password
          };

          var httpOptions = {
            url: window.API_BASE_URL + "/auth/user",
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
          notificationService.showErrorMessage(err);
          reject(ex);
        }

      });
    } //  end of function _signup()


    function _logout(email) {
      try {
        // var acToken = $cookies.get('ocean-ac-token');
        // var userInfo =jwt_decode(acToken);
        return new Promise((function(resolve, reject){
          $http({
            url : window.API_BASE_URL + "/auth",
            method : "DELETE",
            params : {
              email : email
            }
          })
          .then(function(){
            resolve();
          })
          .catch(function(err){
            reject(err);
          })
        }))
      }
      catch(ex) {
        notificationService.showErrorMessage(ex);
        $cookies.remove('ocean-ac-token');
        $window.location.href=($rootScope.serverUrl+"/#!/login");
      }
    } //  end of function _logout()

    function _checkPassword(password) {
      var result = '';

      result = __checkAlphabetic(password);
      if (result) {
        return [false, '비밀번호는 숫자 또는 특수문자(!@#$%)를 포함해야 합니다.'];
      }

/*
      result = __checkAlphaNumeric(password);
      if (result) {
        return [false, '비밀번호는 특수문자(!@#$%)를 포함해야 합니다.'];
      }
*/
      result = __checkAlphaNumericSpecial(password);
      if (!result) {
        return [false, '비밀번호는 알파벳 대/소문자, 숫자, 특수문자(!@#$%)만을 포함해야 합니다.'];
      }

      result = __checkLength(password);
      if (result) {
        return [false, '비밀번호의 길이가 충분하지 않습니다.'];
      }

      return [true, '사용 가능한 비밀번호입니다.'];
    } //  end of function _checkPassword()


    function __checkAlphabetic(password) {
      var matched = password.match(/^[a-zA-Z]+$/);

      if (!!matched && matched[0] === password) {
        return true;
      }

      return false;
    }

    function __checkAlphaNumeric(password) {
      var matched = password.match(/^[a-zA-Z0-9]+$/);

      if (!!matched && matched[0] === password) {
        return true;
      }

      return false;
    }

    function __checkAlphaNumericSpecial(password) {
      var matched = password.match(/^[a-zA-Z0-9!@#$%]+$/);

      if (!!matched && matched[0] === password) {
        return true;
      }

      return false;
    }

    function __checkLength(password, minLength) {
      minLength = minLength || MIN_PASSWORD_LENGTH;

      return password.length < minLength;
    }

    function _reIssueToken() {
      return new Promise(function(resolve, reject){
        try {
          var reToken = $cookies.get('ocean-re-token');
          $http({
            url :  window.API_BASE_URL + '/auth/re',
            method: "POST",
            headers : {
              'ocean-re-token' : reToken
            }
          })
          .then(function(res){
            var acToken = $cookies.get('ocean-ac-token');
            if(!acToken){
              reject(new Error("Could not get Access Token"))
            } else {
              resolve();
            }
          })
          .catch(function(err){
            reject(err);
          })
        }catch(err){
          reject(err);
        }
      })
    }
    function _getAccessToken(){
      return new Promise(function(resolve, reject){
        var acToken = $cookies.get('ocean-ac-token');
        if(acToken) {
          resolve(acToken);
        } else {
          _reIssueToken()
            .then(function(){
              var acToken = $cookies.get('ocean-ac-token');
              if(acToken){
                resolve(acToken);
              } else {
                reject(new Error("사용자 인증에 실패했습니다."))
              }
            })
            .catch(function(err){
              reject(err);
            })
        }
      })
    }
  } //   end of function AuthService()
})();
