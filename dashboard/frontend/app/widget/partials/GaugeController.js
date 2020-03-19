(function () {
  angular
      .module('dashboard')
      .controller('GaugeController', ['$scope',  GaugeController ]);

  function GaugeController($scope) {

    var vm = $scope;

    function renderChart() {
      try {
        //  "gauge_data" type value 
        //  {
        //    dataType: 'gauge_data', /* mandatory */
        //    name: NAME, /* mandatory */
        //    value: VALUE, /* mandatory */
        //    units: UNITS, /* optional, default % */
        //    min: MIN_VALUE, /* optional, default 0 */
        //    min: MAX_VALUE, /* optional, default 100 */
        // }
        var widgetData = $scope.$parent.widget.widgetData;

        //  check widgetData type
        if(widgetData && widgetData.dataType === 'gauge_data') {

          vm.min = widgetData.min;
          vm.max = widgetData.max;
          vm.units = widgetData.units;

          vm.gaugePoints = [];
          vm.gaugeColumns = [];
          var gaugeData = {};
          gaugeData[widgetData.name] = widgetData.value;

          vm.gaugePoints.push(gaugeData);
          var gaugeColumn = {
            "id": widgetData.name,
            "type": "gauge"
          };
          vm.gaugeColumns.push(gaugeColumn);

        }
        else {
          return;
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
