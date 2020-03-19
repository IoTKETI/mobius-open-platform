(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('homeController', HomeController)
  ;


  HomeController.$inject = ['$scope', '$state', 'apiService', 'notificationService'];
  function HomeController($scope, $state, apiService, notificationService) {

    $scope.init = _init;

    function _init() {

    }
  }

})();
