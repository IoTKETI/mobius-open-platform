(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('personalLayoutController', PersonalLayoutController)
  ;


  PersonalLayoutController.$inject = ['$scope', '$rootScope', '$window', '$mdDialog', '$mdSidenav', 'authService', 'notificationService'];



  function PersonalLayoutController($scope, $rootScope, $window, $mdDialog, $mdSidenav, authService, notificationService) {


    $scope.init = function () {
      if(!$rootScope.user){
        authService.getSysInfo().then(function(info){
          $rootScope.setServiceURL(info.serviceUrl);
        })
        authService.getLoginUser().then(function(user){
          $rootScope.user = user;
        })
        .catch(function(err){
          notificationService.showErrorMessage(err, true);
          $window.location.href=$rootScope.serverUrl+"/#!/login";
        });
      }
    };
    $scope.onClickLogout = function(){
      authService.logout($rootScope.user.u_e)
        .then(function(result){
          $window.location.href=$rootScope.serverUrl+"/#!/login";
        })
        .catch(function(err){
          notificationService.showErrorMessage(err, true);
        })
    }
  }
})();
