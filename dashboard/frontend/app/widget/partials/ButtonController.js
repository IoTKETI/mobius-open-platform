(function () {
    angular
        .module('dashboard')
        .controller('ButtonController', ['$scope', 'apiService',
            ButtonController
        ]);

    function ButtonController($scope, apiService) {
      $scope.widget = $scope.$parent.widget;


      if (!$scope.widget.widgetData) {
        $scope.widget.widgetData = {
          path: '/Mobius/justin/ss',
          value: 100
        };
      }

      if (!$scope.widget.widgetData.path ) {
        $scope.widget.widgetData.path = '/Mobius/justin/ss';
      }

      $scope.onClickButton = function() {
        apiService.widget.trigger($scope.widget.widgetId, $scope.widget.widgetData.path, $scope.widget.widgetData.value)
          .then(function(){


          });
      }
    }
})();
