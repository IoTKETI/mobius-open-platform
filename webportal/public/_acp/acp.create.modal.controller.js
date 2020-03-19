(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('createAcpModalController', CreateAcpModalController)
  ;



  CreateAcpModalController.$inject = ['$scope', '$state', 'close'];


  function CreateAcpModalController($scope, $state, close) {

    $scope.formData = {
      acpResource: {
        rn: '',
        lbl: []
      },
    };

    $scope.dismissModal = _dismissModal;
    $scope.createAcp = _createAcp;

    function _dismissModal() {
      close(null, 200); // close, but give 200ms for bootstrap to animate
    }

    function _createAcp() {

      close($scope.formData.acpResource, 200); // close, but give 200ms for bootstrap to animate
    }

  }



})();
