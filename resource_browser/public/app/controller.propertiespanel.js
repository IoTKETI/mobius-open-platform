(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('propertiesPanelController', PropertiesPanelController);

    PropertiesPanelController.$inject = ['$scope', '$rootScope', 'store', 'resmonService', 'eventService'];


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
    function PropertiesPanelController($scope, $rootScope, store, resmonService, eventService) {


      $scope.rawData = {};
      $scope.showPanel = true;

      //
      //  scope functions 
      //  
      //////////////////////////////
      $scope.init = initScope;
      $scope.toggleShowHide = toggleShowHide;


      //
      //  implements functions 
      //
      /////////////////////////////////
      function initScope() {
        //  register event listeners
        //eventService.on($rootScope, 'monitoring.start', onMonitoringStartRequest);

        eventService.on($rootScope, 'monitoring.select.resource', onSelectResourceRequest);


      }

      function toggleShowHide() {
        $scope.showPanel = !$scope.showPanel;

        if( $scope.showPanel ) {
          $(".monitor-view-side").removeClass("collapsed");
        }
        else {
          $(".monitor-view-side").addClass("collapsed");
        }
      }

      function onSelectResourceRequest(event, arg) {
        $scope.$apply(function () {
          $scope.rawData = arg;
        });
      }


    };


})();
