(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('dataBrowserController', DataBrowserController)
  ;



  DataBrowserController.$inject = ['$scope', '$state', '$stateParams', 'deviceService', 'alertService'];


  function DataBrowserController($scope, $state, $stateParams, deviceService, alertService) {

    $scope.deviceList = [];
    $scope.browserData = [];
    $scope.deviceId = $stateParams.deviceId;


    $scope.init = _init;
    $scope.onSelectDeviceItem = _onSelectDeviceItem;
    $scope.onSelectBrowserItem = _onSelectBrowserItem;

    $scope.refreshData = _refreshData;

    function _init() {

      deviceService.list()

      .then(function(deviceList){
        $scope.$apply(function(){
          $scope.deviceList = deviceList;


          var defaultSelection = null;
          if($scope.deviceId) {
            defaultSelection = $scope.deviceList.find(function (item) {
              return (item.deviceId == $scope.deviceId);
            });
          }

          if(defaultSelection == null) {
            defaultSelection = $scope.deviceList[0]
          }

          if(defaultSelection) {
            _onSelectDeviceItem(defaultSelection);
          }
        });
      }, function(err){
        alertService.showErrorMessage(err);
      });

    } //  end of function _init()


    function _onSelectDeviceItem(resource) {

      $scope.deviceList.map(function(item){
        item.selected = '';
      });
      resource.selected = 'selected';

      var resourceId = resource.resourceInfo.resourceId;
      var resourceName = resource.resourceInfo.resourceName;
      deviceService.browse(resourceId, resourceName)
        .then(function(browseResult){
          $scope.$apply(function(){
            $scope.browserData = [];
            $scope.browserData.push(browseResult);
          });
        }, function(err){
          alertService.showErrorMessage(err);
        });
    } //  end of function _onSelectDeviceItem()


    function _refreshData() {
      var depth = $scope.browserData.length - 2;
      var resource = null;
      $scope.browserData[depth].resources.map(function(item){
        if(item.selected)
          resource = item;
      });

      if( resource != null ) {
        _onSelectBrowserItem(depth, resource);
      }
    } //  end of function _refreshData()

    function _onSelectBrowserItem(depth, resource) {
      var resourceId = resource.resourceId;
      var resourceName = resource.resourceName;

      if( depth >= 0 ) {
        $scope.browserData[depth].resources.map(function(item){
          if(item.resourceId == resourceId)
            item.selected = 'selected';
          else
            item.selected = '';
        });

        $scope.selectionDepth = depth;
      }

      //  선택된 resource가 cin인 경우 cin의 con을 보여주기 위해 browerData에 con을 추가 
      switch(resource.resourceType) {
        case  'cin':
          var browseResult = {
            "cinContent": resource.content
          };
          if($scope.browserData.length > (depth+1))
            $scope.browserData.splice(depth+1, 100);
          $scope.browserData.push(browseResult);
          __makeSelectedColumnVisible(depth-1);

          break;

        default:
          deviceService.browse(resourceId, resourceName)
            .then(function(browseResult){
              $scope.$apply(function(){
                if($scope.browserData.length > (depth+1))
                  $scope.browserData.splice(depth+1, 100);
                $scope.browserData.push(browseResult);

                __makeSelectedColumnVisible(depth);
              });
            }, function(err){
              alertService.showErrorMessage(err);
            });
          break;
      }
    }

    function __makeSelectedColumnVisible(depth) {
      var scrollContainer = $("#mobius-browser");
      var scrollLeft = scrollContainer[0].scrollWidth;

      if(scrollLeft != -1 ) {
        setTimeout(function(sl){
          scrollContainer.scrollLeft(sl);
        }, 100, scrollLeft);
      }
    }

  }



})();
