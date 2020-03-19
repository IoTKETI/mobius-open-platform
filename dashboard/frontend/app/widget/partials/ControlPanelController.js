(function () {

    angular
        .module('dashboard')
        .controller('ControlPanelController', ['$scope',
            '$mdDialog', '$interval',
            ControlPanelController
        ]);

    function ControlPanelController($scope, $mdDialog, $interval) {


      var vm = $scope;

      function renderChart() {
        vm.values = [];
        try {
          //  "progress_data" type value 
          //  {
          //    dataType: 'progress_data', /* mandatory */
          //    name: NAME, /* mandatory */
          //    value: VALUE, /* mandatory */
          //    units: UNITS, /* optional, default % */
          //    color: MIN_VALUE /* optional, default 'primary' */
          // }
          var widgetDataList = $scope.$parent.widget.widgetData;
          if(!Array.isArray(widgetDataList)) {
            widgetDataList = [widgetDataList];
          }
  
          if(widgetDataList) {
            widgetDataList.map(function(widgetData){
              //  check widgetData type
              if(widgetData && widgetData.dataType === 'progress_data') {
                var valueItem = {
                  "name": widgetData.name,
                  "value": widgetData.value,
                  "units": widgetData.units,
                  "color": widgetData.color
                };

                vm.values.push(valueItem);
              }
            });
          }
        }
        catch(ex) {
          console.log(ex);
        }
      }

      renderChart();

      $scope.$parent.$watch('widget.widgetData', function(value){
        renderChart();
      }, true);
    }

})();