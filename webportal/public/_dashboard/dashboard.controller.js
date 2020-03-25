(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('dashboardController', DashboardController)
  ;



  DashboardController.$inject = ['$scope', '$state', 'dashboardService', 'alertService'];


  function DashboardController($scope, $state, dashboardService, alertService) {


    var brandPrimary =  '#20a8d8';
    var brandSuccess =  '#4dbd74';
    var brandInfo =     '#63c2de';
    var brandWarning =  '#f8cb00';
    var brandDanger =   '#f86c6b';

    var grayDark =      '#2a2c36';
    var gray =          '#55595c';
    var grayLight =     '#818a91';
    var grayLighter =   '#d1d4d7';
    var grayLightest =  '#f8f9fa';

    //convert Hex to RGBA
    function convertHex(hex,opacity){
      hex = hex.replace('#','');
      var r = parseInt(hex.substring(0,2), 16);
      var g = parseInt(hex.substring(2,4), 16);
      var b = parseInt(hex.substring(4,6), 16);

      var result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
      return result;
    }

    function _parseUTCDateString(sDate) {
      if(sDate) {
        var year = 0;
        var month = 1;
        var day = 1;

        switch(sDate.length) {
          case 4:
            year = parseInt(sDate.substring(0, 4));
            break;

          case 6:
            year = parseInt(sDate.substring(0, 4));
            month = parseInt(sDate.substring(4, 6));
            break;

          case 8:
            year = parseInt(sDate.substring(0, 4));
            month = parseInt(sDate.substring(4, 6));
            day = parseInt(sDate.substring(6, 8));
            break;

          default:
            throw new Error('Illegal arguments. Not expected date string');
        }

        var date = new Date(0);
        date.setUTCFullYear(year, month-1, day);
        return date;
      }
      else {
        throw new Error('Illegal arguments. Not expected date string');
      }
    }

    $scope.volumeIndex = {};
    $scope.userIndex = {};



    $scope.init = _init;
    $scope.protocolPercentage = _protocolPercentage;
    $scope.totalCBSString = _totalCBSString;


    function _init() {
      dashboardService.getDashboardData()
        .then(function(data){
          $scope.$apply(function(){


            if(data.userDevices.success) {
              $scope.userIndex.userDevices = data.userDevices.data;
            }
            else {
              alertService.showErrorMessage(data.userDevices.error.message);
              $scope.userIndex.userDevices = 0;
            }

            if(data.sharedDevices.success) {
              $scope.userIndex.sharedDevices = data.sharedDevices.data;
            }
            else {
              alertService.showErrorMessage(data.sharedDevices.error.message);
              $scope.userIndex.sharedDevices = 0;
            }

            if(data.userAcps.success) {
              $scope.userIndex.userAcps = data.userAcps.data;
            }
            else {
              alertService.showErrorMessage(data.userAcps.error.message);
              $scope.userIndex.userAcps = 0;
            }


            if(data.numberOfUsers.success) {
              $scope.volumeIndex.numberOfUsers = data.numberOfUsers.data;
            }
            else {
              alertService.showErrorMessage(data.numberOfUsers.error.message);
              $scope.volumeIndex.numberOfUsers = 0;
            }

            if(data.numberOfAEs.success) {
              $scope.volumeIndex.numberOfAEs = data.numberOfAEs.data;
            }
            else {
              alertService.showErrorMessage(data.numberOfAEs.error.message);
              $scope.volumeIndex.numberOfAEs = 0;
            }

            if(data.totalCBS.success) {
              $scope.volumeIndex.totalCBS = data.totalCBS.data;
            }
            else {
              alertService.showErrorMessage(data.totalCBS.error.message);
              $scope.volumeIndex.totalCBS = 0;
            }

            if(data.trafficData.success) {
              $scope.trafficData = {};

              var trafficData = data.trafficData.data;

              $scope.trafficData.labels = trafficData.labels;
              //['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Thursday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              $scope.trafficData.series = trafficData.series;
              //['Current', 'Previous', 'BEP'];
              $scope.trafficData.data = trafficData.data;
              //[ data1, data2, data3];


              var maxValue = 0;
              var countByProtocol = new Array(4).fill(0);
              $scope.trafficData.data.map(function(item, index, array){
                item.map(function(value){
                  countByProtocol[index] += value;
                  maxValue = Math.max(maxValue, value);
                });
              });

              var peakData = 0;
              var peakDate = '';

              var sum = 0;
              $scope.trafficData.labels.map(function(item, index){
                var count = 0;

                $scope.trafficData.data.map(function(protocol){
                  count += protocol[index];
                });

                peakData = Math.max(peakData, count);
                if(peakData == count)
                  peakDate = $scope.trafficData.labels[index];

                sum += count;
              });

              $scope.trafficData.peakData = peakData;
              $scope.trafficData.peakDate = _parseUTCDateString(peakDate);

              //  TODO: peak data 빼고, 오늘 평균
              var startDate = _parseUTCDateString($scope.trafficData.labels[0]);
              var endDate = _parseUTCDateString($scope.trafficData.labels[$scope.trafficData.labels.length-1]);
              var period = Math.round((endDate-startDate)/(1000*60*60*24));
              if(period <= 0)
                period = 1;
              $scope.trafficData.averageDate = Math.round(sum / period);


              $scope.trafficData.colors = ['#375E97', '#FB6542', '#FFBB00', '#3F681C'];

              $scope.trafficData.options = {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                  display: true,
                  position: 'bottom'
                },
                scales: {
                  xAxes: [{
                    gridLines: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: function(value) {
                        var localTime = _parseUTCDateString(value);
                        return localTime.toLocaleDateString();
                      }
                    }
                  }],
                  yAxes: [{
                    ticks: {
                      beginAtZero: true,
                      maxTicksLimit: 5,
                      stepSize: Math.ceil(maxValue / 5),
                      max: maxValue
                    }
                  }]
                },
                elements: {
                  point: {
                    radius: 2,
                    hitRadius: 10,
                    hoverRadius: 4,
                    hoverBorderWidth: 3,
                  }
                }
              }

              $scope.trafficData.protocol = {};
              $scope.trafficData.protocol.labels = ['HTTP', 'MQTT', 'CoAP', 'Websocket'];
              $scope.trafficData.protocol.data = countByProtocol;

            }
            else {
              alertService.showErrorMessage(data.trafficData.error.message);
            }





          });
        })

        .catch(function(err){
          alertService.showErrorMessage(err);
        })
      ;

    }

    function _protocolPercentage(index) {

      if($scope.trafficData && $scope.trafficData.protocol && $scope.trafficData.protocol.data && $scope.trafficData.protocol.data[index]) {
        var total = 0;
        $scope.trafficData.protocol.data.map(function(item){
          total += item;
        });

        if(total == 0 )
          return 0;

        return $scope.trafficData.protocol.data[index] / total * 100;
      }
      else {
        return 0;
      }
    }



    var CONTENTS_SIZE_BYTES = [
      {name: 'PB', value: 1024*1024*1024*1024*1024},
      {name: 'TB', value: 1024*1024*1024*1024},
      {name: 'GB', value: 1024*1024*1024},
      {name: 'MB', value: 1024*1024},
      {name: 'KB', value: 1024}
    ];


    function _totalCBSString() {

      if($scope.volumeIndex.totalCBS) {

        for(var i=0; i < CONTENTS_SIZE_BYTES.length; i++) {
          if($scope.volumeIndex.totalCBS > CONTENTS_SIZE_BYTES[i].value) {

console.log( $scope.volumeIndex.totalCBS, CONTENTS_SIZE_BYTES[i].value, i, CONTENTS_SIZE_BYTES[i].name);

            var number = new Number(parseInt($scope.volumeIndex.totalCBS/CONTENTS_SIZE_BYTES[i].value));
            return number.toLocaleString() + ' ' + CONTENTS_SIZE_BYTES[i].name;
          }
        }

        var number = new Number(parseInt($scope.volumeIndex.totalCBS));
        return number.toLocaleString() + ' B';
      }
      else {
        return '-';
      }
    }




  }



})();
