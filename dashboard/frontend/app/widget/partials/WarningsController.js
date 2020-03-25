(function () {
    angular
        .module('dashboard')
        .controller('WarningsController', ["$scope", 'widgetDataService',
            WarningsController
        ]);

    function WarningsController($scope, widgetDataService) {
        $scope.widgetData = $scope.$parent.widget.widgetData;

        var vm = this;

        // TODO: move data to the service


      setInterval(function(){
        vm.warningsChartData = [ { values: $scope.$parent.widget.widgetData, color: 'rgb(0, 150, 136)', area: true } ];

        $scope.$apply(); // update both chart
      }, 500);

      vm.chartOptions = {
            chart: {
                type: 'lineChart',
                height: 210,
                margin: { top: -10, left: -20, right: -20 },
                x: function (d) { return d.x },
                y: function (d) { return d.y },
                showLabels: false,
                showLegend: false,
                title: 'Over 9K',
                showYAxis: false,
                showXAxis: false,
                tooltip: { contentGenerator: function (d) { return '<span class="custom-tooltip">' + Math.round(d.point.y) + '</span>' } }
            }
        };
    }
})();
