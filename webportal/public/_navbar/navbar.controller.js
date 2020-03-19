(function(){
  'use strict';

  angular
    .module('mobiusPortal')
    .controller('navbarController', NavbarController)
  ;

  NavbarController.$inject = ['$rootScope', '$scope', '$state', '$translate', 'authService'];

  function NavbarController($rootScope, $scope, $state, $translate, authService) {

    function checkLanguage(languages, langKey) {
      languages.map(function (language) {
        if (language.langKey == langKey) {
          $scope.flag = language.flag;
          $scope.lang = language.lang;
          return language
        } else {

          return null
        }
      });
    }

    var languages = [
      {
        lang: 'Polish',
        langKey: 'pl',
        flag: 'Poland.png'
      },
      {
        lang: 'English',
        langKey: 'en',
        flag: 'United-Kingdom.png'
      },
      {
        lang: 'Español',
        langKey: 'es',
        flag: 'Spain.png'
      }
    ]



    $scope.languages = languages;


    $scope.init = _init;
    $scope.logout = _logout;
    $scope.loginuser = null;
    checkLanguage(languages, $translate.use());

    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
      checkLanguage(languages, langKey);
    };


    function _init() {
      authService.loginUser()
        .then(function(loginuser){
          $scope.$apply(function(){
            $scope.loginuser = loginuser
          })
          // do nothing
        })

        .catch(function(err){

        })
      ;
    }

    function _logout() {
      authService.logout()
        .then(function(result){
          $scope.loginuser = null;
          $state.go('main.dashboard');
        })

        .catch(function(err){

        })
      ;
    }
/*
    $rootScope.$watch('loginuser', function(newValue, oldValue){
      if(newValue != null && oldValue == null) {
        //  logged out

        $state.go('main.dashboard');
      }
    });
*/
  }

})();



