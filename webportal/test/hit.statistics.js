


var hits = {
  "20171228": [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {
      "H": 27
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ],
  "20171229": [
    {},
    {},
    {},
    {
      "H": 13,
      "M": 567
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ],
  "20180102": [
    {
      "H": 2982
    },
    {
      "H": 5119
    },
    {
      "H": 7967
    },
    {
      "H": 8184
    },
    {
      "H": 8199
    },
    {
      "H": 8133
    },
    {
      "H": 8158
    },
    {
      "H": 8212
    },
    {
      "H": 8119
    },
    {
      "H": 8173
    },
    {
      "H": 8213
    },
    {
      "H": 8144
    },
    {
      "H": 8126
    },
    {
      "H": 5167
    },
    {
      "H": 5144
    },
    {
      "H": 5083
    },
    {
      "H": 3541
    },
    {
      "H": 3544
    },
    {
      "H": 3549
    },
    {
      "H": 3587
    },
    {
      "H": 3552
    },
    {
      "H": 3541
    },
    {
      "H": 3551
    },
    {
      "H": 3553
    }
  ],
  "20180103": [
    {
      "H": 2635
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ]
};




var MS_PER_A_DAY = (1000 * 60 * 60 * 24); //  1000ms * 60s * 60m * 24h
var MS_PER_A_MONTH = (1000 * 60 * 60 * 24 * 30); //  1000ms * 60s * 60m * 24h



function TrafficData(hits) {

  this.updateHits(hits);
}

TrafficData.prototype.updateHits = _updateHits;
TrafficData.prototype.byMonth = _byMonth;
TrafficData.prototype.byDate = _byDate;



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
    console.log( from );
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


var trafficData = new TrafficData(hits);
console.log(trafficData.byMonth());
console.log(trafficData.byDate());
