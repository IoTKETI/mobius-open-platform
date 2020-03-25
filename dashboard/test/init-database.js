'use strict';

var config = require('../backend/config.js')();
global.CONFIG = config;

var database = require('../backend/models/mongodb.js');


database.connect(config);

var WidgetsModel = require('../backend/models/widgets.model.js');
var DatasourceModel = require('../backend/models/datasource.model.js');
var UserModel  = require('../backend/models/user.model.js');



var TEST_TEMPLATES = [
  {
    widgetType: 'visitors',
    title: 'Site visitors'
  },
  {
    widgetType: 'warnings',
    tiwidgetTypetle: 'Warnings'
  },
  {
    widgetType: 'gauge',
    title: 'Memory load'
  },
  {
    widgetType: 'value-list',
    title: 'Progress'
  },
  {
    widgetType: 'line',
    title: 'Performance'
  },
  {
    widgetType: 'button',
    title: 'Trigger'
  }
];



function _randomSelect(ary) {
  return ary[parseInt(Math.random() * ary.length - 0.5)];
}
function testWidgetData(widgetName) {
  switch(widgetName) {
    case 'visitors':
      var mobile = Math.random() * 10000;
      var desktop = Math.random() * 10000;
      return [{key: 'Mobile', y: mobile}, { key: 'Desktop', y: desktop}];

    case 'warnings':
      var result = [];
      for (var i = 0; i < 100; i++) {
        result.push({x: i, y: Math.abs(Math.cos(i/10) *0.25*i + 0.9 - 0.4*i)});
      }
      return result;
      break;


    case'gauge':
      var gauge = Math.random() * 100;
      return [{key: 'gauge', y: gauge}, { key: 'free', y: 100-gauge}];

    case 'value-list':
      return [
        {
          title: 'Processor check',
          value: Math.random() * 100
        },
        {
          title: 'Memory check',
          value: Math.random() * 100
        },
        {
          title: 'Storage check',
          value: Math.random() * 100
        },
      ];

    case 'line':
      break;

  }
}
function _testData() {


  var selected = _randomSelect(TEST_TEMPLATES);
  selected = JSON.parse(JSON.stringify(selected));

  selected.widgetData = testWidgetData(selected.widgetType);

  return selected;

}


var userId = 'user3';

var _user = null;
var datasourceList = [];


WidgetsModel.remove()
  .then(()=>{
    return DatasourceModel.remove();
  })

  .then(()=>{
    return UserModel.findOneByUserId(userId);
  })

  .then((userDoc)=> {

    _user = userDoc;

    var WIDGET_TYPES = [
      "fas fa-chart-bar",
      "fas fa-chart-line",
      "fas fa-chart-pie",
      "fas fa-tachometer-alt",
      "fas fa-compass",
      "fas fa-map-marked",
      "fas fa-percent",
    ];

    for( var i=0; i < 4; i++) {


      var testData = _testData();

      var datasource = {
        datasourceType: _randomSelect(WIDGET_TYPES),
        description: "this datasource 'datasource-00" + i + "' is the datasource to control ...",
        status: ((i % 4) == 0 ? "inactive" : "active"),
        workspace: '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="onem2m_trigger" id="8y^Ep^g(@rZsL)X/a?Q;" x="353" y="68"><field name="CON_VALUE">con</field><value name="RESOURCE_PATH"><block type="text" id="l,36-7`e3*2X#So4y]1I"><field name="TEXT">SUMMIT_DEMO/led</field></block></value><statement name="logic"><block type="controls_if" id="NKXyF`IU!:oY!|v)Pe3N"><value name="IF0"><block type="logic_boolean" id="tC|_)+z9|c@=+[`U]oz!"><field name="BOOL">TRUE</field></block></value><statement name="DO0"><block type="variables_set" id="K0f?V_YE}2F!%bL0@_Hn"><field name="VAR">con</field><value name="VALUE"><block type="variables_get" id="R^l*5ls[8_vV7o:gWis~"><field name="VAR">con</field></block></value></block></statement></block></statement><value name="output"><block type="output_visitor" id="SuEG#p*E#!YfcA{Or/3="><value name="LABEL_1"><block type="text" id="oa-|EUP8TS.*i#q|EHRy"><field name="TEXT">LED</field></block></value><value name="VALUE_1"><block type="variables_get" id="P]U`/KllsW=|m;/|;pH`"><field name="VAR">con</field></block></value><value name="LABEL_2"><block type="text" id="Ba/cTPklNItTCmm%v%LR"><field name="TEXT">led</field></block></value><value name="VALUE_2"><block type="variables_get" id="evMYTd%YN2RjJSTxs8.u"><field name="VAR">con</field></block></value></block></value></block></xml>',
        triggerInfo: {
          "widgetType": testData.widgetType,
          "type" : "onem2m_trigger",
          "output": 'output_' + testData.widgetType,
          "resourcePath" : "/Mobius/SUMMIT_DEMO/led",
          "code" : "var con;\n\n\n// MQTT EVENT Trigger for 'SUMMIT_DEMO/led'\nfunction __executeOneM2MTriggerHandler(_widgetId_, _params_) {\n  con = _params_;\n  if (true) {\n    con = con;\n  }\nvar __dataset__ = [\n  {\"key\": 'LED', \"y\" : con},\n  {\"key\": 'led', \"y\" : con},\n]\nreturn __dataset__;\n}\nmodule.exports = __executeOneM2MTriggerHandler;"
        },
        widgetData: testData.widgetData
      };


      datasourceList.push(datasource);
    }

    return Promise.all(
      datasourceList.map((datasource) => {

        return DatasourceModel.createDatasource(_user, datasource.datasourceType, datasource.description, datasource.status, datasource.widgetData, datasource.triggerInfo);
      })
    )

  })

  .then((datasourceDocList)=>{
    var widgetList = [];
    for(var i=0; i < 8; i++ ) {

      var testData = {};

      testData.datasource = _randomSelect(datasourceDocList);
      testData.widgetType = testData.datasource.triggerInfo.widgetType;
      testData.title = _randomSelect(TEST_TEMPLATES).title;


      widgetList.push(testData)
    }

    return Promise.all(
      widgetList.map((widget)=>{

        return  WidgetsModel.createWidget(_user, widget.widgetType, widget.title, widget.datasource._id);
      })
    )
  })

    
  .then((userDoc)=> {

      process.exit(1);
  })


  .catch((ex)=>{
    console.log( 'ERROR', ex);
    process.exit(1);

  });

