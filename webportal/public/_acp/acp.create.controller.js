(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('acpCreateController', AcpCreateController)
  ;



  AcpCreateController.$inject = ['$scope', '$state', 'acpService', 'alertService'];


  function AcpCreateController($scope, $state, acpService, alertService) {

    $scope.acpCreate = [];

    $scope.init = _init;

    function _init() {

      acpService.Create()

      .then(function(acpCreate){
        $scope.$apply(function(){
          $scope.acpCreate = acpCreate;


        });
      }, function(err){
        alertService.showErrorMessage(err);
      });

    }

  }



})();
