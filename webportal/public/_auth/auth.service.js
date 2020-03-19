
(function(){
  'use strict';

  angular
    .module('mobiusPortal')
    .service('authService', AuthService);


  AuthService.$inject = ['$http', '$rootScope', 'alertService', '$cookies', 'jwtHelper'];

  var MIN_PASSWORD_LENGTH = 8;

  var SERVICE_URL = {
    "login" : "/auth/login",
    "logout" : "/auth/logout",
    "signup" : "/auth/signup",
    "loginUser" : "/auth/user",
    "reIssueToken" : "/auth/re/token",
    "resetPassword" : "/auth/password/reset-token",
    "changePassword" : "/auth/password"
  }

  function AuthService($http, $rootScope, alertService, $cookies, jwtHelper) {

    var services = {
      "login": _login,
      "signup": _signup,
      "logout": _logout,
      "loginUser": _loginUser,
      "reIssueToken" : _reIssueToken,
      "checkPassword": _checkPassword,
      "requestResetPassword": _requestResetPassword,
      "changePassword": _changePassword,
      "getAccessToken" : _getAccessToken
    };
    return services;



    function _login(email, password) {
      return new Promise(function(resolve, reject) {

        try {
          var body = {
            "email": email,
            "password": password
          };

          var httpOptions = {
            url: window.API_BASE_URL + SERVICE_URL['login'],
            method: "POST",
            data: body
          };

          $http(httpOptions)

          .then(function(response){
            $rootScope.loginuser = response.data;
            var acToken = $cookies.get('ocean-ac-token');
            var reToken = $cookies.get('ocean-re-token');
            if(!acToken || !reToken){
              throw new Error("로그인에 실패했습니다. 다시 시도해주세요");
            }
            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            alertService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()

    function _requestResetPassword(email) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + SERVICE_URL['resetPassword'],
            method: "POST",
            data: {email : email}
          };

          $http(httpOptions)

          .then(function(response){
            //$rootScope.loginuser = response.data;

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            alertService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _changePassword(token, password, passwordConfirm) {
      return new Promise(function(resolve, reject) {

        var data = {
          token: token,
          password: password,
          passwordConfirm: passwordConfirm
        };
        _getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + SERVICE_URL['changePassword'],
              method: "PUT",
              data: data
            };
  
            return $http(httpOptions)
          })
          .then(function(response){
            //$rootScope.loginuser = response.data;

            resolve(response.data);
          })
          .catch(function(err){
            console.error(err);
            alertService.showErrorMessage(err, true);
            reject(err);
          });
      });
    } //  end of function _login()


    function _loginUser() {
      return new Promise(function(resolve, reject) {

        try {
          _getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + SERVICE_URL['loginUser'],
              method: "GET"
            };
            return $http(httpOptions)
          }) 
          .then(function(response){
            var lastLoginTime = null;
            if($rootScope.loginuser != null)
              lastLoginTime = $rootScope.loginuser.lastLoginTime;
            $rootScope.loginuser = response.data;
            if(lastLoginTime != null)
              $rootScope.loginuser.lastLoginTime = lastLoginTime;

            var acToken = $cookies.get('ocean-ac-token');
            if(!acToken){
              throw new Error("로그인에 실패했습니다. 다시 시도해주세요");
            }
            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            $rootScope.loginuser = null;
            // alertService.showErrorMessage(err);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()

    function _reIssueToken() {
      return new Promise(function(resolve, reject){
        try {
          var reToken = $cookies.get('ocean-re-token');
          $http({
            url :  window.API_BASE_URL + SERVICE_URL['reIssueToken'],
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
          alertService.showErrorMessage(err);
          reject(ex);
        }

      });
    } //  end of function _signup()


    function _logout() {
      return new Promise(function(resolve, reject) {

        try {
          _getAccessToken()
            .then(function(token) {

              var httpOptions = {
                url: window.API_BASE_URL + SERVICE_URL['logout'],
                headers : {
                  'ocean-ac-token' : token,
                },
                method: "POST"
              };
    
              return $http(httpOptions)
            })
            .then(function(response){
              $rootScope.loginuser = null;
              $cookies.remove('ocean-ac-token', {domain : $rootScope.domain});
              $cookies.remove('ocean-re-token', {domain : $rootScope.domain});
              resolve(response.data);
            })

            .catch(function(err){
              console.error(err);
              $rootScope.loginuser = null;
              alertService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
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
