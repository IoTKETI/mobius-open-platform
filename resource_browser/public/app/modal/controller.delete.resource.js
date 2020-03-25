(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('deleteResourceModalController', DeleteResourceModalController);

    DeleteResourceModalController.$inject = ['$scope', 'resourceNode', 'close'];

    /**
     * [PropertiesPanelController description]
     * @param {[type]} $scope        [description]
     * @param {[type]} resmonService [description]
     *
     *
     * View 생성 및 UI control event 처리 
     *   onem2m server와의 통신은 onem2mService에 deligate
     *   resource monitor server와의 통신은 resmonService에 deligate 
     */
    function DeleteResourceModalController($scope, resourceNode, close) {


      var resourceObj = resourceNode.data;
      var resourceType = _.keys(resourceObj)[0];

      $scope.resourceResource = resourceNode;
      $scope.resourceName = resourceObj[resourceType]['rn'];
      //  thkim unstructured ri 적용
      //$scope.resourceId = resourceObj[resourceType]['pi'] + "/" + resourceObj[resourceType]['ri'];
      $scope.resourceId = resourceObj[resourceType]['ri'];
      $scope.resourceIdCheck = '';
      $scope.deleteOriginator = resourceObj[resourceType]['cr'];
      $scope.invalidResourceId = '';


      //  scope functions 
      //  
      //////////////////////////////
      $scope.close = closeModal;


      //
      //  implements functions 
      //
      /////////////////////////////////
      function closeModal(result) {
        var resourceId = '';

        if( result ) {
          if ($scope.resourceName == $scope.resourceIdCheck) {
            resourceId = $scope.resourceId;

            var deleteInfo = {
              resourceId: resourceId,
              deleteOriginator: $scope.deleteOriginator
            };

            close(deleteInfo, 500); //  close, but give 500ms for bootstrap to animate
          }
          else {
            $scope.invalidResourceId = "Resource name is not matched!"
            $scope.resourceIdCheck = '';
            close({message : $scope.invalidResourceId}, 500);
          }
        }
        else {
          close(null, 500); //  close, but give 500ms for bootstrap to animate
        }
      }
    }


})();
