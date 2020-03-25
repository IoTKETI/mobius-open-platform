(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('deviceListController', DeviceListController)
  ;



  DeviceListController.$inject = ['$scope', '$state', 'deviceService', 'alertService', 'ModalService'];


  function DeviceListController($scope, $state, deviceService, alertService, ModalService) {

    $scope.deviceList = [];
    $scope.deviceFilter = '';

    $scope.init = _init;
    $scope.deviceListFilter = _deviceListFilter;
    $scope.itemCommandHandler = _itemCommandHandler;

    function _init() {

      deviceService.list()

      .then(function(deviceList){
        $scope.$apply(function(){
          $scope.deviceList = deviceList;


        });
      }, function(err){
        alertService.showErrorMessage(err);
      });

    }


    function _itemCommandHandler(command, device) {
      switch( command ) {
        case 'edit':
          $state.go('main.device.device-edit', {'deviceId': device.deviceId});
          break;

        case 'unregister':


          var modalOptions = {
            templateUrl: "_common/confirm.modal.html",
            controller: "confirmModalController",
            inputs: {
              theme: 'danger',
              title: '리소스 등록 취소',
              messages: ['선택된 디바이스의 등록이 취소되며, 등록 정보가 삭제됩니다.', '이 작업은 복구할 수 없습니다.'],
              prompt: '계속 진행 하시겠습니까?'
            }
          };

          ModalService.showModal(modalOptions)

            .then(function(modal) {
              modal.element.modal();

              modal.close.then(function(result) {
                if(result) {

                  deviceService.unregisterDevice(device.deviceId)

                    .then(function(deviceList){
                      $scope.$apply(function(){
                        var index = $scope.deviceList.findIndex(function(item){
                          if(item.deviceId == device.deviceId)
                            return true;
                          else
                            return false;
                        });

                        $scope.deviceList.splice(index, 1);
                      });
                    }, function(err){
                      alertService.showErrorMessage(err);
                    });

                }
              });
            });





          break;

        case 'delete':

          var modalOptions = {
            templateUrl: "_common/confirm.modal.html",
            controller: "confirmModalController",
            inputs: {
              theme: 'danger',
              title: '리소스 삭제 확인',
              messages: ['선택된 디바이스와 연결된 리소스가 삭제됩니다.', '삭제된 리소스는 복구할 수 없습니다.'],
              prompt: '계속 진행 하시겠습니까?'
            }
          };

          ModalService.showModal(modalOptions)

            .then(function(modal) {
              modal.element.modal();

              modal.close.then(function(result) {
                if(result) {

                  deviceService.deleteDeviceResource(device.deviceId)

                    .then(function(deviceList){
                      $scope.$apply(function(){
                        var index = $scope.deviceList.findIndex(function(item){
                          if(item.deviceId == device.deviceId)
                            return true;
                          else
                            return false;
                        });

                        $scope.deviceList.splice(index, 1);
                      });
                    }, function(err){
                      alertService.showErrorMessage(err);
                    });

                }
              });
            });

          break;

        case 'browse':
          $state.go('main.data-browser', {'deviceId': device.deviceId});
          break;

        case 'ota':
          $state.go('main.ota-manager', {'aeResourceName': device.resourceInfo.resourceName});
          break;
      }
    }

    function _deviceListFilter(device) {
      if($scope.deviceFilter.trim() == '')
        return true;

      var keyword = $scope.deviceFilter.toLowerCase();

      var comparableString = [];
      if(device.deviceInfo) {
        if(device.deviceInfo.nickname)
          comparableString.push(device.deviceInfo.nickname);
        if(device.deviceInfo.description)
          comparableString.push(device.deviceInfo.description);
      }

      if(device.resourceInfo) {
        if(device.resourceInfo.resourceName)
          comparableString.push(device.resourceInfo.resourceName);
      }

      if(device.owner) {
        if(device.owner.email)
          comparableString.push(device.owner.email);
        if(device.owner.userid)
          comparableString.push(device.owner.userid);
        if(device.owner.name)
          comparableString.push(device.owner.name);
      }

      var found = false;
      comparableString.map(function(str){
        var strLow = str.toLowerCase();

        if(strLow.indexOf(keyword) != -1)
          found = true;
      });

      return found;
    }

  }



})();
