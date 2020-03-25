(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('inputAcpnameModalController', InputAcpnameModalController);

  InputAcpnameModalController.$inject = ['$scope', 'acpName', 'close'];



  function InputAcpnameModalController($scope, acpName, close) {

    $scope.acpName = acpName;


    //  scope functions
    //
    //////////////////////////////
    $scope.close = closeModal;


    //
    //  implements functions
    //
    /////////////////////////////////
    function closeModal(result) {
      if(result)
        close($scope.acpName, 500); //  close, but give 500ms for bootstrap to animate
      else
        close(null, 500);
    }
  };


})();
