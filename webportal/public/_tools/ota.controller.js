(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('otaController', OtaController)
  ;



  OtaController.$inject = ['$scope', '$state', '$stateParams', 'otaService', 'alertService'];


  function OtaController($scope, $state, $stateParams, otaService, alertService) {

    $scope.formData = {
      aeResourceName: $stateParams.aeResourceName,
      version: [],
      passCode: '',
      uploadFilePath: ''
    };

    $scope.init = _init;

    $scope.getFirmwareVersion = _getFirmwareVersion;
    $scope.fileNameChanged = _fileNameChanged;


    function _init() {




    } //  end of function _init()


    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }


    function uploadFirmwareFile() {

      var aeName = $scope.formData.aeResourceName.trim();
      var passCode = $scope.formData.passCode.trim();
      var version = $scope.formData.version.join('.');

      if(aeName.length > 0
        && passCode.length > 0
        && version.length > 0
        && isEffective
        && str_ary
        && str_ary.length > 0) {

        var ver_ary = version.split('.');

        if(ver_ary.length == 4){
          for(var i = 0; i < ver_ary.length; i++){
            if(!isNumeric(ver_ary[i])){
              showDialog("error", "Version value must be a set of number that bigger than 0!");
              return;
            }
          }
        } else {
          showDialog("error", "Version value must be x.x.x.x format!");
          return;
        }

        var loader_progress = ssi_modal.show(loaderOption);

        $.ajax({
          type: "POST",
          url: "/fw/" + aeName + "/" + version + "?id=" + generateUUID(),
          contentType: "application/json",
          cache: false,
          headers: {
            "key": passCode
          },
          data: JSON.stringify(str_ary),
          success: function (msg) {
            loader_progress.close();
            showDialog("success", msg);
          },
          error: function(e) {
            loader_progress.close();
            showDialog("error", "Upload file failed!");
          }
        });
      } else {
        showDialog("warning", "Need more information!")
      }
    } //  end of function uploadFirmwareFile()


    function _fileNameChanged(ele) {
      $scope.$apply(function(){
        if(ele.files.length == 0 ) {
          $scope.formData.uploadFilePath = '';
        }
        else {
          $scope.formData.uploadFilePath = ele.files[0].name;
        }
      });


      var reader = new FileReader();
      reader.onload = function (event) {
        var inputResult = reader.result;
        var isEffective = false;

        var str_ary = inputResult.split(/\r\n|\r|\n/g);

        str_ary.splice(-1,1);

        console.log(str_ary.length);

        for(var i = 0; i < str_ary.length; i++){
          if(str_ary[i][0] != ':'){
            isEffective = false;
            alertService.showErrorMessage('유효한 헥사 파일이 아닙니다.');
            return;
          }
        }

        var last_line = str_ary[$scope.str_ary.length - 1];

        if(last_line == ':00000001FF'){
          isEffective = true;
        }
      }

      reader.readAsText(ele.files[0]);

    }


    function _getFirmwareVersion() {

      var aeName = $scope.formData.aeResourceName;
      aeName = aeName.trim();

      if(aeName.length <= 0 ) {
        alertService.showErrorMessage('AE 이름을 입력하세요.');
        return ;
      }

      otaService.getVersion(aeName)
        .then(function(version){
          $scope.$apply(function(){
            var versionArray = version.split('.');

            $scope.formData.version = new Array(versionArray.length);
            versionArray.map(function(field, index){
              $scope.formData.version[index] = parseInt(field);
            })
          });
        })
        .catch(function(err){
          alertService.showErrorMessage(err);
        });
    }

  }



})();
