(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('datasourceListController', DatasourceListController)
  ;

  DatasourceListController.$inject = ['$scope', '$rootScope', '$state', '$mdDialog', 'apiService', 'notificationService' ];

  function DatasourceListController($scope, $rootScope, $state, $mdDialog, apiService, notificationService ) {

    $scope.init = function () {

      apiService.datasource.list()
        .then(function(datasourceList){
          $scope.$apply(function(){
            $scope.datasourceList = datasourceList;
          });
        });


    };


    $scope.deleteDatasource = function(datasource) {
      if(!confirm("삭제된 위젯은 복구할 수 없습니다. 삭제하시겠습니까?")) {
        return;
      }

      apiService.datasource.delete(datasource.datasourceId)
      .then(function(result){
        $scope.$apply(function(){
          var index = $scope.datasourceList.indexOf(datasource);
          $scope.datasourceList.splice(index, 1);
        });
      });
    };

    $scope.showDatasourceGenerator = function(datasource) {

      var param = {
        datasourceId: datasource.datasourceId
      };

      $state.go('datasource', param);
    };

    $scope.createNewDatasource = function() {

      var param = {
        datasourceId: null
      };

      $state.go('datasource', param);
    };

    $scope.onDatasourceStatusChanged = function(datasource) {

      if( datasource.status == 'inactive' ) {
        apiService.datasource.run(datasource.datasourceId)
          .then(function(datasource){
            $scope.$apply(function(){
              datasource.status = 'active';
            });
          });
      }
      else {
        apiService.datasource.stop(datasource.datasourceId)
        .then(function(datasource){
          $scope.$apply(function(){
            datasource.status = 'inactive';
          });
        });
      }
    };


  }

})();
