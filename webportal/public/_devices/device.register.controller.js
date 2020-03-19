(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('deviceRegisterController', DeviceRegisterController)
  ;



  DeviceRegisterController.$inject = ['$scope', '$state', 'deviceService', 'alertService'];


  var ICON_NAMES = [
    "fa-plane",
    "fa-anchor",
    "fa-plus-square",
    "fa-balance-scale",
    "fa-gamepad",
    "fa-bed",
    "fa-bell",
    "fa-bicycle",
    "fa-bug",
    "fa-bus",
    "fa-camera",
    "fa-car",
    "fa-cart-plus",
    "fa-coffee",
    "fa-desktop",
    "fa-basketball-ball",
    "fa-female",
    "fa-fire-extinguisher",
    "fa-umbrella",
    "fa-heart",
    "fa-home",
    "fa-road",
    "fa-industry",
    "fa-thermometer-three-quarters",
    "fa-map",
    "fa-microphone",
    "fa-battery-full"
  ];

  function DeviceRegisterController($scope, $state, deviceService, alertService) {

    $scope.iconList = ICON_NAMES;

    $scope.formData = {
      "findResource": {
        aeName: "",
        aeId: ""
      }
    };

    $scope.selectedAe = null;
    $scope.newDevice = {
      deviceInfo: {
        icon: "fa-home",
        nickname: "",
        description: ""
      },
      resourceInfo: {
        deviceName: "",
        resourceId: ""
      },
      acpList:[]
    };


    $scope.deviceList = [];
    $scope.browserData = [];


    $scope.init = _init;
    $scope.findMobiusResource = _findMobiusResource;
    $scope.selectDeviceIcon = _selectDeviceIcon;
    $scope.addNewDevice = _addNewDevice;

    function _init() {




    } //  end of function _init()


    function _findMobiusResource(){

      $scope.selectedAe = null;
      $scope.newDevice.resourceInfo.resourceName = null;

      deviceService.findAeResource($scope.formData.findResource.aeName, $scope.formData.findResource.aeId)
        .then(function(aeObj){
          $scope.$apply(function(){

            $scope.selectedAe = aeObj['m2m:ae'];
            $scope.newDevice.resourceInfo.resourceName = $scope.selectedAe.rn;
            $scope.newDevice.resourceInfo.resourceId = $scope.selectedAe.ri;
          })
        }, function(err){
          alertService.showErrorMessage(err);
        });
    }




    function _selectDeviceIcon(icon) {
      $scope.newDevice.deviceInfo.icon = icon;

    }


    function _addNewDevice() {
      deviceService.addNewDevice($scope.newDevice)
      .then(function(result){
        $state.go('main.device.device-list');
      }, function(err){
        alertService.showErrorMessage(err);
      });
    }

  }



})();
