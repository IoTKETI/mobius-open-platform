(function () {
    'use strict';

  angular
    .module('dashboard')
    .service('widgetDataService', [
        WidgetDataService
    ]);

    function WidgetDataService() {

        var service = {
            getWidgetData: getWidgetData
        };

        return service;

        function getWidgetData(widgetId) {

        }
    }
})();
