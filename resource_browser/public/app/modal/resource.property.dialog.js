(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('resourcePropertyDialogController', ResourcePropertyDialogController);

  ResourcePropertyDialogController.$inject = ['$scope', '$mdDialog', 'resourceData'];


  function ResourcePropertyDialogController($scope, $mdDialog, resourceData) {

    $scope.resourceData = resourceData;



    $scope.close = _close;



    function _close() {
      $mdDialog.hide();
    }

  };


})();
