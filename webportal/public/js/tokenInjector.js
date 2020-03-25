(function(){
  angular
  .module('mobiusPortal')
  .factory('tokenInjector', ['$cookies', '$injector', function($cookies, $injector){
    var requestInterceptor = {
      request : function(config){
        if(config.url.match(/(\.js|html|css|\/dashboard)/)){
          // html, js, css 파일을 불러오거나 dashboard 호출 때는 Token 없이 넘긴다.
          return config;
        } else if(config.method === 'POST' && config.url.match(/\/auth\/login/)){
          // 로그인일 때는 Token없이 넘긴다.
          return config
        } else if(config.method === 'POST' && config.url.match(/\/auth\/signup/)){
          // 가입일 때는 Token없이 넘긴다.
          return config
        } else if(config.method === 'POST' && config.url.match(/\/auth\/password\/reset-token/)){
          // 비번찾기일 때는 Token없이 넘긴다.
          return config
        } else if(config.method === 'POST' && config.url.match(/\/auth\/re\/token/)){
          // 로그인 갱신 때는 Token없이 넘긴다.
          $http = $injector.get('$http');
          if($http.pendingRequests.length < 1){
            $rootScope = $injector.get('$rootScope');
            $rootScope.$broadcast("START_REQUEST");
          }
          return config
        } else {
          var acToken = $cookies.get('ocean-ac-token');
          if(!acToken){
            var reToken = $cookies.get('ocean-re-token');
            if(!reToken){
              window.location.href="./#!";
            } else {
              var authService = $injector.get('authService');
              authService.reIssueToken()
                .then(function(res){
                  acToken = $cookies.get('ocean-ac-token');
                  config.headers['ocean-ac-token'] = acToken;
                  return config;
                })
                .catch(function(err){
                  window.location.href="./#!";
                })
            }
          } else {
            config.headers['ocean-ac-token'] = acToken;
            return config;
          }  
        }
      },
      requestError :  function(rejection){
        return new Promise(function(resolve, reject){
          return reject(rejection);
        })
      },
      responseError : function(response){
        return new Promise(function(resolve, reject){
          if(response.status == 401){
            if(response.config.url.match(/(\/dashboard)/)){
              resolve(response);
            }
            var reToken = $cookies.get('ocean-re-token');
            if(!reToken){
              resolve(response);
              window.location.href="./#!/login"
            }else{
              var authService = $injector.get('authService');
              authService.reIssueToken()
                .then(function(res){
                  var http = $injector.get('$http');
                  resolve(http(response.config));
                })
                .catch(function(err){
                  reject(err);
                })
            }
          }else{
            resolve(response);
          }
        })
      }
    }
    return requestInterceptor;
  }]);

})();