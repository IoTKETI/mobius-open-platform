(function () {
    angular
        .module('dashboard')
        .controller('VisitorsController', ['$scope',
            VisitorsController
        ]);

    function VisitorsController($scope) {
        $scope.widgetData = $scope.$parent.widget.widgetData;

        $scope.chartOptions = {
            chart: {
                type: 'pieChart',
                height: 210,
                donut: true,
                x: function (d) { return d.key; },
                y: function (d) { return d.y; },
                valueFormat: (d3.format(".2f")),
                color: ['rgb(0, 150, 136)', '#E75753'],
                showLabels: false,
                showLegend: false,
                title: 'Over 9K',
                margin: { top: -10 }
            }
        };

        $scope.$parent.$watch('widget.widgetData', function(value){
            $scope.widgetData = value;
        });
    }
})();
