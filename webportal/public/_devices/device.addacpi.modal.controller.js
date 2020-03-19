(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('addAcpiModalController', AddAcpiModalController)
  ;


  AddAcpiModalController.$inject = ['$scope', '$state', 'acpList', 'acpi', 'close'];


  function AddAcpiModalController($scope, $state, acpList, acpi, close) {

    $scope.acpList = acpList;
    $scope.acpi = acpi;
    $scope.acp = null;

    $scope.dismissModal = _dismissModal;
    $scope.applyAcpSelection = _applyAcpSelection;
    $scope.acpItemClass = _acpItemClass;
    $scope.isExsists = _isExsists;
    $scope.selectAcp = _selectAcp;


    $scope.acpList.map(function(acp){
      if($scope.acpi.indexOf(acp.ri) == -1)
        acp.selected = false;
      else
        acp.selected = true;
    });


    function _selectAcp(acp) {
      $scope.acp = acp;
    }

    function _acpItemClass(acp) {
      var result = [];

      if(acpi.indexOf(acp.ri) != -1)
        result.push('exists');

      if($scope.acp === acp)
        result.push('active');

      return result;
    }

    function _isExsists(acp) {
      if(acpi.indexOf(acp.ri) != -1)
        return true;

      return false;
    }


    function _dismissModal() {
      close(null, 200); // close, but give 200ms for bootstrap to animate
    }

    function _applyAcpSelection() {
      var result = [];
      $scope.acpList.map(function(acp){
        if(acp.selected)
          result.push(acp.ri);
      });

      close(result, 200); // close, but give 200ms for bootstrap to animate
    }

  }



})();
