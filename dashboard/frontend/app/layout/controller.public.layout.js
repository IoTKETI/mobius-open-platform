(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('publicLayoutController', PublicLayoutController)
  ;


  var STATES_HAS_BACKGROUND = ['login', 'signin', 'password-reset', 'password-change'];

  PublicLayoutController.$inject = ['$scope', '$rootScope', '$state', '$window', 'authService', 'notificationService'];

  function PublicLayoutController($scope, $rootScope, $state, $window, authService, notificationService) {
    $scope.hasBGImage = 'has-bg-image';

    $scope.open = false;
    $scope.account = false;
    $rootScope.user = null;
    $scope.init = function () {
      try{
        authService.getLoginUser().then(function(user){
          $rootScope.user = user;
        })
        .catch(function(err){
          notificationService.showErrorMessage(err, true);
          $window.location.href=$rootScope.serverUrl+"/#!/login";
        });
      
        if(STATES_HAS_BACKGROUND.indexOf($state.current.name) == -1)
          $scope.hasBGImage = '';
        else
          $scope.hasBGImage = 'has-bg-image';
      }catch(err){
        notificationService.showErrorMessage(err, true);
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
