(function(){
  angular
  .module('dashboard')
  .factory('tokenInjector', ['$cookies', '$injector', function($cookies, $injector){
    var requestInterceptor = {
      request : function(config){
        if(config.url.match(/(\.js|html|css|\/dashboard)/)){
          // html, js, css 파일을 불러오거나 dashboard 호출 때는 Token 없이 넘긴다.
          return config;
        } else if(config.method === 'POST' && config.url.match(/\/auth\/login/)){
          // 로그인일 때는 Token없이 넘긴다.
          return config
        }
        var acToken = $cookies.get('ocean-ac-token');
        if(!acToken){
          window.location.href="./#!";
        } else {
          config.headers['ocean-ac-token'] = acToken;
          return config;
        }
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