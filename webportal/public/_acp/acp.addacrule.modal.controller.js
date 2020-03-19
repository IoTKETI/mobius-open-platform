(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('acpAddacruleModalController', AcpAddacruleModalController)
  ;



  AcpAddacruleModalController.$inject = ['$scope', '$state', 'alertService', 'close'];


  function AcpAddacruleModalController($scope, $state, alertService, close) {

    $scope.formData = {
      acOriginId: '',
      acOrigins: [],
      acOperation: [true, true, true, true, true, true]
    };
    $scope.acop = __getAcop($scope.formData.acOperation);

    $scope.dismissModal = _dismissModal;
    $scope.addAcrule = _addAcrule;

    $scope.addAcor = _addAcor;
    $scope.deleteAcor = _deleteAcor;


    function _dismissModal() {
      close(null, 200); // close, but give 200ms for bootstrap to animate
    }


    function __getAcop(acOperation) {
      var acop = 0;
      acOperation.map(function(item, index){
        if(item) {
          acop += (0x01 << index);
        }
      });

      return acop;
    }

    function _addAcrule() {
      $scope.acop = __getAcop($scope.formData.acOperation);

      var result = {
        "acor": $scope.formData.acOrigins,
        "acop": $scope.acop + ''
      }
      close(result, 200); // close, but give 200ms for bootstrap to animate
    }


    function _addAcor() {
      var newAcor = $scope.formData.acOriginId.trim();

      if(newAcor == '')
        return;

      if($scope.formData.acOrigins.indexOf(newAcor) != -1) {
        alertService.showErrorMessage('이미 추가된 ID입니다');
        return;
      }

      $scope.formData.acOrigins.push(newAcor);
      $scope.formData.acOriginId = '';
    }

    function _deleteAcor(index) {
      $scope.formData.acOrigins.splice(index, 1);
    }

    $scope.$watch('formData.acOperation', function() {
      $scope.acop = __getAcop($scope.formData.acOperation);
    }, true);



  }



})();
