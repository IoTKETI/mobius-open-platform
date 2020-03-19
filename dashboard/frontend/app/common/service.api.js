(function() {
  'use strict';

  angular
    .module('dashboard')
    .service('apiService', ApiService);


  ApiService.$inject = ['$http', '$state', 'notificationService', 'localStorageService', '$cookies', 'authService'];

  function ApiService($http, $state, notificationService, localStorageService, $cookies, authService) {

    return {
      user: {
        checkUserId: _user_checkUserId,
        signin: _user_signin,

        login: _user_login

      },

      widget: {
        list: _widget_list,
        get: _widget_get,
        trigger: _widget_trigger,
        update: _widget_update,
        create: _widget_create,
        delete: _widget_delete,
        order: _widget_order
      },

      datasource: {
        update: _datasource_update,
        delete: _datasource_delete,
        run: _datasource_run,
        stop: _datasource_stop
      } 
    };



    function _widget_list() {
      return new Promise(function(resolve, reject) {

        try {


          authService.getAccessToken(httpOptions)
            .then(function(token){
              var httpOptions = {
                headers : {
                  "ocean-ac-token" : token
                },
                url: window.API_BASE_URL + '/widget',
                method: "GET"
              };
              return $http(httpOptions)
            })
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _widget_get(widgetId) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget/' + widgetId,
              method: "GET"
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _widget_list() {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget',
              method: "GET"
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _widget_trigger(widgetId, path, data) {
      return new Promise(function(resolve, reject) {

        try {
          var triggerData = {
            path: path,
            data: data
          };
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget/' + widgetId,
              method: "POST",
              data: triggerData
            };
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }



    function _widget_update(widgetId, data) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget/' + widgetId,
              method: "PUT",
              data: data
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }

    function _widget_order(widgetIds) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget/widget-order',
              method: "PUT",
              data: widgetIds
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }

    
    function _widget_delete(widgetId) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget/' + widgetId ,
              method: "DELETE"
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }



    function _widget_create(widgetInfo) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/widget' ,
              method: "POST",
              data: widgetInfo
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }





    function _datasource_update(datasourceId, updateData) {
      return new Promise(function(resolve, reject) {

        try {

          var requestUrl = window.API_BASE_URL + '/datasource';
          var requestMethod = 'POST';

          if(datasourceId) {
            requestUrl += '/' + datasourceId;
            requestMethod = 'PUT'
          }

          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: requestUrl,
              method: requestMethod,
              data: updateData
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _datasource_delete(datasourceId) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/datasource/' + datasourceId,
              method: 'DELETE'
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }




    function _datasource_run(datasourceId, triggerInfo) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/datasource/' + datasourceId + '/run',
              method: "PUT",
              data: triggerInfo
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _datasource_stop(datasourceId) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/datasource/' + datasourceId + '/stop',
              method: "PUT"
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){

              resolve(response.data);
            })

            .catch(function(err){
              notificationService.showErrorMessage(err);

              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }











    function _saveLoginInfo(tokens) {
      $cookies.set('ocean-ac-token', tokens.atkn);
      $cookies.set('refreshToken', tokens.rtkn);

      var loginUser = jwt_decode(tokens.atkn);
      localStorageService.set('loginUser', loginUser);
    }

    function _clearLoginInfo(tokens) {
      localStorageService.remove('ocean-ac-token', 'refreshToken', 'loginUser');
    }





    function _user_checkUserId(signinInfo) {
      return new Promise(function(resolve, reject) {

        try {
          var params = {
            userId: signinInfo.userId,
            email: signinInfo.email
          };
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/user/idcheck',
              method: "GET",
              params: params
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })

            .catch(function(err){
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _user_signin(signinInfo) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/user',
              method: "POST",
              data: signinInfo
            };
            return $http(httpOptions)
          }) 
            .then(function(response){
              resolve(response.data);
            })

            .catch(function(err){
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }



    function _user_login(loginInfo) {
      return new Promise(function(resolve, reject) {

        try {
          authService.getAccessToken()
          .then(function(acToken){
            var httpOptions = {
              headers : {
                  'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/auth/token',
              method: "POST",
              data: loginInfo
            };
  
            return $http(httpOptions)
          }) 
            .then(function(response){
              _saveLoginInfo(response.data);

              resolve(response.data);
            })

            .catch(function(err){
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }
  }

})();
