(function() {
  'use strict';

  angular
    .module('dashboard')
    .directive('dashboardDatasource', DashboardDatasourceDirective)
  ;

  DashboardDatasourceDirective.$inject = ['$document'];

  function DashboardDatasourceDirective($document, $scope) {
    var directive = {
      restrict: 'A',
      templateUrl: '/app/datasource/directive.datasource.html',
      scope: {
        datasource: '=',
        onEdit: '=',
        onDelete: '=',
        onChangeStatus: '='
      },
      link: link,
      controller: controller
    }
    return directive;

    function link(scope, element, attr) {

    }

    function controller($scope) {



      $scope.toggleStatus = function() {

        if($scope.onChangeStatus) {
          $scope.onChangeStatus($scope.datasource);
          $scope.datasource.status = $scope.datasource.status === 'inactive' ? 'active' : 'inactive';
        }
      };


      $scope.delete = function() {

        if($scope.onDelete) {
          $scope.onDelete($scope.datasource);
        }
      };


      $scope.gotoEditor = function() {

        if($scope.onEdit) {
          $scope.onEdit($scope.datasource);
        }
      }

    }
  }


})();
