
(function(){
  'use strict';

  angular
    .module('mobiusPortal')
    .service('dashboardService', DashboardService);


  DashboardService.$inject = ['$http', 'authService'];




  var MS_PER_A_DAY = (1000 * 60 * 60 * 24); //  1000ms * 60s * 60m * 24h
  var MS_PER_A_MONTH = (1000 * 60 * 60 * 24 * 30); //  1000ms * 60s * 60m * 24h


  function TrafficData(hits) {

    var oldType = {};
    hits.map(function(item){
      var data = {
        'H': item.http,
        'M': item.mqtt,
        'C': item.coap,
        'W': item.ws
      };

      oldType[item.ct] = (new Array(24)).fill(0);
      oldType[item.ct][0] = data;
    });

    this.updateHits(oldType);
  }

  TrafficData.prototype.updateHits = _updateHits;
  TrafficData.prototype.byMonth = _byMonth;
  TrafficData.prototype.byDate = _byDate;
  TrafficData.prototype.toDay = _toDay;



  function _updateHits(hits) {
    this.hits = hits;


    this.times = Object.keys(this.hits);

    this.beginDate = _getDate(this.times[0]);
    this.endDate = _getDate(this.times[this.times.length-1]);


  }


  function _getDate(sDate) {
    var year = parseInt(sDate.substring(0, 4));
    var month = parseInt(sDate.substring(4, 6));
    var day = parseInt(sDate.substring(6, 8));

    var date = new Date(0);
    date.setUTCFullYear(year, month-1, day);

    return date;
  }

  function _padding(num, len) {
    var result = '000000000000' + num;
    return result.substring(result.length-len, result.length);
  }

  function _byMonth() {
    var now = new Date();

    var labels = [];
    var series = ['HTTP', 'MQTT', 'CoAP', 'WS'];
    var dataHttp = [];
    var dataMqtt = [];
    var dataCoap = [];
    var dataWs = [];
    var data = [dataHttp, dataMqtt, dataCoap, dataWs];


    var beginDate = new Date(parseInt(this.beginDate/MS_PER_A_MONTH) * MS_PER_A_MONTH);
    var fromYear = beginDate.getFullYear();
    var fromMonth = beginDate.getMonth();

    var toYear = now.getFullYear();
    var toMonth = now.getMonth();

    for(; fromYear < toYear || (fromYear == toYear && fromMonth <= toMonth); ) {
      var timeSlotStr = _padding(fromYear, 4) + _padding(fromMonth + 1, 2);
      labels.push(timeSlotStr);

      fromMonth ++;
      if(fromMonth == 12) {
        fromMonth = 0;
        fromYear ++;
      }
    }

    data = [
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0)
    ];


    for(var d = 0; d < this.times.length; d++) {
      var timeValue = this.times[d].substring(0, 6);

      var countHttp = 0;
      var countMqtt = 0;
      var countCoap = 0;
      var countWs = 0;

      this.hits[this.times[d]].map(function(item){
        if(item['H']) countHttp += item['H'];
        if(item['M']) countMqtt += item['M'];
        if(item['C']) countCoap += item['C'];
        if(item['W']) countWs += item['W'];
      });

      var index = labels.indexOf(timeValue);
      data[0][index] += countHttp;
      data[1][index] += countMqtt;
      data[2][index] += countCoap;
      data[3][index] += countWs;
    }


    return {
      labels: labels,
      series: series,
      data: data
    };

  }


  function _byDate() {
    var labels = [];
    var series = ['HTTP', 'MQTT', 'CoAP', 'WS'];


    var beginDate = new Date(parseInt(this.beginDate/MS_PER_A_DAY) * MS_PER_A_DAY);
    var endDate = new Date(parseInt(Date.now()/MS_PER_A_DAY) * MS_PER_A_DAY);

    for(var from = beginDate; from <= endDate;) {
      var timeSlotStr = _padding(from.getFullYear(), 4) + _padding(from.getMonth() + 1, 2) + _padding(from.getDate(), 2);
      labels.push(timeSlotStr);

      from = new Date(from.getTime() + MS_PER_A_DAY);
    }

    var data = [
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0)
    ];


    for(var d = 0; d < this.times.length; d++) {
      var timeValue = this.times[d];

      var countHttp = 0;
      var countMqtt = 0;
      var countCoap = 0;
      var countWs = 0;

      this.hits[this.times[d]].map(function(item){
        if(item['H']) countHttp += item['H'];
        if(item['M']) countMqtt += item['M'];
        if(item['C']) countCoap += item['C'];
        if(item['W']) countWs += item['W'];
      });

      var index = labels.indexOf(timeValue);
      data[0][index] += countHttp;
      data[1][index] += countMqtt;
      data[2][index] += countCoap;
      data[3][index] += countWs;
    }


    return {
      labels: labels,
      series: series,
      data: data
    };
  }



  function _toDay() {
    var labels = [];
    var series = ['HTTP', 'MQTT', 'CoAP', 'WS'];


    var today = new Date(parseInt(Date.now()/MS_PER_A_DAY) * MS_PER_A_DAY);
    var todayStr = _padding(today.getFullYear(), 4) + _padding(today.getMonth() + 1, 2) + _padding(today.getDate(), 2);


    for(var t=0; t < 24; t++) {
      var timeSlotStr = _padding(t, 4) + 'H';
      labels.push(timeSlotStr);
    }

    var data = [
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0),
      new Array(labels.length).fill(0)
    ];

    if(this.hits[todayStr]) {

      var countHttp = 0;
      var countMqtt = 0;
      var countCoap = 0;
      var countWs = 0;

      this.hits[todayStr].map(function(item){
        if(item['H']) countHttp += item['H'];
        if(item['M']) countMqtt += item['M'];
        if(item['C']) countCoap += item['C'];
        if(item['W']) countWs += item['W'];
      });

      var index = labels.indexOf(timeValue);
      data[0][index] += countHttp;
      data[1][index] += countMqtt;
      data[2][index] += countCoap;
      data[3][index] += countWs;

    }
    else {

    }


    for(var d = 0; d < this.times.length; d++) {
      var timeValue = this.times[d];

      var countHttp = 0;
      var countMqtt = 0;
      var countCoap = 0;
      var countWs = 0;

      this.hits[this.times[d]].map(function(item){
        if(item['H']) countHttp += item['H'];
        if(item['M']) countMqtt += item['M'];
        if(item['C']) countCoap += item['C'];
        if(item['W']) countWs += item['W'];
      });

      var index = labels.indexOf(timeValue);
      data[0][index] += countHttp;
      data[1][index] += countMqtt;
      data[2][index] += countCoap;
      data[3][index] += countWs;
    }


    return {
      labels: labels,
      series: series,
      data: data
    };
  }











  function DashboardService($http, authService, store) {

    var services = {
      "getDashboardData": _getDashboardData
    };
    return services;


    function _getDashboardData() {
      return new Promise(function(resolve, reject) {

        try {

          authService.getAccessToken()
          .then(function(acToken){
            
            var httpOptions = {
              headers : {
                'ocean-ac-token' : acToken
              },
              url: window.API_BASE_URL + '/dashboard',
              method: "GET"
            };
            return $http(httpOptions)
          })
          .then(function(response){

            var result = response.data;

            if(result.trafficData.success) {
              var trafficData = new TrafficData(response.data.trafficData.data);
              result.trafficData.data = trafficData.byDate();
            }

            resolve(result);
          })
          .catch(function(err){
            console.error(err);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()

  } //   end of function AuthService()
})();
