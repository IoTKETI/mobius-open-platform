(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('deviceEditController', DeviceEditController)
  ;



  DeviceEditController.$inject = ['$scope', '$state', '$stateParams', 'deviceService', 'acpService', 'ModalService', 'alertService'];


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

  function DeviceEditController($scope, $state, $stateParams,  deviceService, acpService, ModalService, alertService) {

    $scope.deviceId = $stateParams.deviceId;
    $scope.iconList = ICON_NAMES;
    $scope.device = null;
    $scope.iconChanged = false;
    $scope.acpFilter = '';

    $scope.headerColorClass = _headerColorClass;
    $scope.iconImageAndColorClass = _iconImageAndColorClass;
    $scope.isSaveButtonDisabled = _isSaveButtonDisabled;
    $scope.addAcpiToDevice = _addAcpiToDevice;
    $scope.deleteAcpiFromDevice = _deleteAcpiFromDevice;
    $scope.editAcpResource = _editAcpResource;
    $scope.saveDeviceInfo = _saveDeviceInfo;
    $scope.acpListFilter = _acpListFilter;


    var CARD_HEADER_COLOR_CLASSES = [
      'bg-primary',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-success'
    ];

    var ICON_BG_COLOR_CLASSES = [
      'bg-primary',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-success'
    ];

    function _headerColorClass() {
      var code = 0;

      if($scope.device && $scope.device.deviceInfo && $scope.device.deviceInfo.nickname)
        code = $scope.device.deviceInfo.nickname.charCodeAt(0);

      return CARD_HEADER_COLOR_CLASSES[code % CARD_HEADER_COLOR_CLASSES.length];
    }

    function _iconImageAndColorClass(icon) {
      var code = 0;

      if($scope.device && $scope.device.deviceInfo && $scope.device.deviceInfo.nickname)
        code = $scope.device.deviceInfo.nickname.charCodeAt(0);

      return [icon, ICON_BG_COLOR_CLASSES[code % ICON_BG_COLOR_CLASSES.length]];
    }

    function _deleteAcpiFromDevice(acp) {
      deviceService.deleteDeviceAcpi($scope.device.deviceId, acp.ri)
        .then(function(device){
          $scope.$apply(function(){
            $scope.device = device;
          });
        }, function(err){
          alertService.showErrorMessage(err);
        });
    }

    function _editAcpResource(acp) {
      $state.go('main.acp.acp-list', {acpId: acp.ri });
    }

    function _saveDeviceInfo() {
      deviceService.saveDeviceInfo($scope.device.deviceId, $scope.device.deviceInfo)
        .then(function(device){
          $scope.$apply(function(){
            $scope.device = device;

            alertService.showInfoMessage('디바이스 정보가 성공적으로 저장되었습니다.');
            __setDeviceInfoPristine();
          });
        }, function(err){
          alertService.showErrorMessage(err);
        });
    }

    function _addAcpiToDevice() {


      acpService.list()

        .then(function(acpList){
//          $scope.$apply(function(){

            acpList.map(function(acp){
              if(acp.lbl == undefined) {
                acp.lbl = [];
              }
            });

            var modalOptions = {
              templateUrl: "_devices/device.addacpi.modal.html",
              controller: "addAcpiModalController",
              inputs: {
                acpList: acpList,
                acpi: $scope.device.resourceInfo.resourceObject.acpi
              }
            };

            ModalService.showModal(modalOptions)

              .then(function(modal) {
                modal.element.modal();

                modal.close.then(function(result) {
                  if(result && result.length > 0) {

                    deviceService.updateDeviceAcpi($scope.device.deviceId, result)
                      .then(function(device){
                        $scope.$apply(function(){
                          $scope.device = device;
                          $scope.iconChanged = false;
                        });
                      }, function(err){
                        alertService.showErrorMessage(err);
                      });
                  }
                });
            });




          //}); //  $apply()
        }, function(err){
          alertService.showErrorMessage(err);
        });


    }

    function __setDeviceInfoPristine() {
      $scope.formDeviceNickname.deviceNickname.$setPristine();
      $scope.formDeviceNickname.deviceDescription.$setPristine();
      $scope.iconChanged = false;
    }

    function _isSaveButtonDisabled() {
      var formIsDirty = false;
      var formIsValid = false;

      if( $scope.formDeviceNickname.deviceNickname.$dirty )
        formIsDirty = true;
      if( $scope.formDeviceNickname.deviceDescription.$dirty )
        formIsDirty = true;
      if( $scope.iconChanged )
        formIsDirty = true;

      if( $scope.formDeviceNickname.deviceNickname.$valid )
        formIsValid = true;

      return !formIsValid || !formIsDirty;
    }

    $scope.init = _init;
    $scope.selectDeviceIcon = _selectDeviceIcon;

    function _init() {

      //  lode device info
      //  from db & device AE resource & ACPs which linked by acpi property
      deviceService.getDeviceInfo($scope.deviceId)
        .then(function(device){
          $scope.$apply(function(){
            $scope.device = device;
            $scope.iconChanged = false;
          });
        }, function(err){
          console.error(err);
          alertService.showErrorMessage(err);
        });

    } //  end of function _init()


    function _selectDeviceIcon(icon) {

      if($scope.device.deviceInfo.icon == icon)
        return;

      $scope.device.deviceInfo.icon = icon;
      $scope.iconChanged = true;
    }


    function _acpListFilter(item) {
      if($scope.acpFilter.trim() == '')
        return true;

      var keyword = $scope.acpFilter.toLowerCase();
      var rn = item.rn.toLowerCase();

      if(rn.indexOf(keyword) != -1)
        return true;

      var found = false;
      if(item.lbl) {
        item.lbl.map(function(lbl){
          var lowLbl = lbl.toLowerCase();

          if(lowLbl.indexOf(keyword) != -1)
            found = true;
        });

        if(found)
          return true;
      }

      if(item.pv && item.pv.acr) {
        item.pv.acr.map(function(acr){

          if(acr.acor) {
            acr.acor.map(function(acor){
              var lowAcor = acor.toLowerCase();

              if(lowAcor.indexOf(keyword) != -1)
                found = true;
            });
          }
        });

        if(found)
          return true;
      }

      return false;
    }
  }



})();
