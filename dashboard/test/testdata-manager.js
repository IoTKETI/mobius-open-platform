'use strict';

var shortid = require('shortid');
var compositedVoManager = require("../backend/managers/cvo.manager.js");

var testMakerTypes = [
  'fas fa-bed bluejeans',
  'fas fa-utensils bluejeans',
  'fas fa-book bluejeans',
  'fas fa-industry darkgray',
  'fas fa-pallet darkgray',
  'fas fa-dashboardr-combined darkgray',
  'fas fa-leaf grass',
  'fas fa-lemon grass',
  'fab fa-sticker-mule sunflower',
  'fas fa-ship aqua'
];


var testVOIconTypes = [
  'fas fa-bed bluejeans',
  'fas fa-utensils bluejeans',
  'fas fa-book bluejeans',
  'fas fa-industry darkgray',
  'fas fa-pallet darkgray',
  'fas fa-dashboardr-combined darkgray',
  'fas fa-leaf grass',
  'fas fa-lemon grass',
  'fab fa-sticker-mule sunflower',
  'fas fa-ship aqua'
];

var testIconColor = [
  'bluejeans',
  'darkgray',
  'grass',
  'sunflower',
  'aqua'
];

var testControlNodeTypes = [
  'start',
  'terminal',
  'min',
  'max',
  'sum',
  'onoff',
  'plus',
  'minus',
  'times',
  'divider'
];




var test_NUMBER_OF_TEST_AE = 5;

var test_NUMBER_OF_TEST_VO = 30;
var test_NUMBER_OF_TEST_CVO = 10;

var test_MAX_NUMBER_OF_VO_ON_CVO = 10;
var test_MAX_NUMBER_OF_CNT_ON_AE = 6;



var testAEList = null;
var testVOList = null;
var testCVOList = null;
var testVirtualSpaceList = null;

var __cntIndex = 0;

function _randomNumber(max) {
  return parseInt(Math.random() * max);
}


function __randomPosition() {
  var x = _randomNumber(13)*60 + 30;
  var y = _randomNumber(10)*60 + 30;

  return {x:x, y:y};
}

function __addControlNodes(compositedVO) {


  var node = {
    "nodeId": shortid.generate(),
    "nodeType": "start",
    "nodePosition": __randomPosition(),
    "nodeData": {}
  };
  compositedVO.nodes.splice(0, 0, node);

  var randomNumber = _randomNumber(5);
  for(var i=0; i < randomNumber; i++) {

    var node = {
      "nodeId": shortid.generate(),
      "nodeType": testControlNodeTypes[_randomNumber(testControlNodeTypes.length-2) + 2],
      "nodePosition": __randomPosition(),
      "nodeData": {}
    };

    var index = _randomNumber(compositedVO.nodes.length -1) + 1;

    compositedVO.nodes.splice(index, 0, node);
  }

  var node = {
    "nodeId": shortid.generate(),
    "nodeType": "terminal",
    "nodePosition": __randomPosition(),
    "nodeData": {}
  };
  compositedVO.nodes.push(node);

}

function __testLinkSequantial(compositedVO) {

  var x = 60;
  var y = 60;

  compositedVO.nodes[0].nodePosition = {x: x, y: y};

  for(var i=0; i < compositedVO.nodes.length-1; i++) {

    x += 300;
    if(x > 1000) {
      x = 60;
      y += 180;
    }
    compositedVO.nodes[i+1].nodePosition = {x: x, y: y};

    var source = compositedVO.nodes[i];
    var target = compositedVO.nodes[i+1];

    var link =  {
      linkId: shortid.generate(),
      to: target.nodeId
    };

    source.links = [];
    source.links.push(link);
  }

}

var cntNames = [
  'switch',
  'plug',
  'ragiator',
  'window-sensor'
];


function _generateTestData() {

  try {
    if(testAEList == null ) {
      testAEList = [];
      testVOList = [];

      for( var i=1; i <= test_NUMBER_OF_TEST_AE; i++ ) {
        var ae = {
          "aeId": 'ae-' + i,
          "aeName": 'ae-' + i,
          "containers": [],
          "annotations": {}
        };

        var cntCount = _randomNumber(test_MAX_NUMBER_OF_CNT_ON_AE);
        var cntName = cntNames[_randomNumber(cntNames.length)];
        for(var j=0; j < cntCount; j++) {
          __cntIndex ++;
          var lastValue = _randomNumber(1000);
          var container = {
            "rn": cntName + "-" + __cntIndex,
            "lbl": ["container", cntName + "-" + __cntIndex],
            "lastCin": lastValue
          };

          var annotation = {
              "voId": "cnt-" + __cntIndex,
              "name": cntName + "-" + __cntIndex,
              "resourcePath": "/" + ('ae-' + i) + "/" + (cntName + "-" + __cntIndex),
              "icon": testVOIconTypes[__cntIndex % testVOIconTypes.length],
              "color": testIconColor[__cntIndex % testIconColor.length],
              "voLatestValue": lastValue,
          };


          testVOList.push(annotation);
          ae.containers.push(container);
          ae.annotations[container.rn] = annotation;
        }

        testAEList.push(ae);
      }
    }


    var cvoNames = [
      'Go out',
      'Return to home',
      'Go to sleep',
      'Wake up',
      'Long trip'
    ];





    if(testCVOList == null ) {
      testCVOList = [];

      for (var id = 1; id <= test_NUMBER_OF_TEST_CVO; id++) {

        var compositedVO = {
          "cvoId": 'cvo-' + id,
          "name": cvoNames[_randomNumber(cvoNames.length)] + ' - ' +id,
          "icon": testVOIconTypes[id % testVOIconTypes.length],
          "color": testIconColor[id % testIconColor.length],
          "status": 'RUNNING',
          "nodes": []
        };

        var voCount = 2 + _randomNumber(test_MAX_NUMBER_OF_VO_ON_CVO-2);
        for (var i = 0; i <= voCount; i++) {
          var voIndex = _randomNumber(testVOList.length);
          var vo = testVOList[voIndex];

          var nodeIndex = compositedVO.nodes.indexOf(function(item){
            if(item.nodeData == vo)
              return true;
            else
              return false;
          });

          if(nodeIndex == -1) {

            var x = _randomNumber(750) + 50;
            var y = _randomNumber(550) + 50;

            var node = {
              "nodeId": shortid.generate(),
              "nodeType": "vo",
              "nodePosition": {"x": x, "y": y},
              "nodeData": vo
            };

            compositedVO.nodes.push(node);
          }
        }

        //  control nodes
        //  start and terminal
        __addControlNodes(compositedVO);

        __testLinkSequantial(compositedVO);


        testCVOList.push(compositedVO);
      }
    }

    var vspaceTypes = [
      "Home",
      "Office",
      "Factory",
      "School"
    ];


    if(testVirtualSpaceList == null) {
      testVirtualSpaceList = [];

      var gpsBase = [37.404053, 127.160280];

      for(var id=1; id <= 10; id++) {

        var randLat = 0.02 - Math.random() / 0.5;  //  25
        var randLng = 0.02 - Math.random() / 2;

        var vspaceType = vspaceTypes[_randomNumber(vspaceTypes.length)];

        var virtualSpace = {
          "spaceId": 'space-' + id,
          "spaceType": testMakerTypes[id % testMakerTypes.length],
          "spaceTitle": vspaceType + id,
          "description": 'This is my ' + vspaceType + ' #' + id,
          "gpsPosition": {lat: gpsBase[0] + randLat, lng: gpsBase[1] + randLng},
          "voList": []
        };


        var voCount = 2 + parseInt(Math.random() * 6);

        var voIndexList = [];
        for (var j = 1; j <= voCount; j++) {


          var cvoIndex = _randomNumber(testCVOList.length);
          var cvo = testCVOList[cvoIndex];

          var voNodeList = cvo.nodes.filter(function(item){
            if(item.nodeType == 'vo')
              return true;
            else
              return false;
          });
          if(voNodeList.length == 0)
            continue;

          var voIndex = _randomNumber(voNodeList.length);
          var node = voNodeList[voIndex]
          var vo = voNodeList[voIndex].nodeData;

          if(virtualSpace.voList.indexOf(vo) == -1) {

            var position = {
              "x": 10 + parseInt(Math.random() * 800),
              "y": 10 + parseInt(Math.random() * 700)
            };

            vo.iconPosition = position;
            virtualSpace.voList.push(vo);
          }
        }

        testVirtualSpaceList.push(virtualSpace);
      }
    }

  }
  catch(ex) {
    console.log(ex);
  }
}


function _listVirtualSpaces() {

  _generateTestData();
  return testVirtualSpaceList;

}


function _getVirtualSpace(spaceId) {
  _generateTestData();

  var virtualSpace = testVirtualSpaceList.find(function(item){
    if(item.spaceId == spaceId)
      return true;
    else
      return false;
  });

  return virtualSpace;

}


function _listCVOs() {

  _generateTestData();

  return testCVOList;

}

function _getCVO(cvoId) {

  _generateTestData();

  var cvo = testCVOList.find(function(item){

    if(item.cvoId == cvoId)
      return true;

    return false
  });


  return cvo;

}

function _listVOs() {

  _generateTestData();

  return testVOList;

}

function _listAEResource() {

  _generateTestData();

  return testAEList;

}

/**
 * Expose 'Testdata manager'
 */


module.exports.listVirtualSpaces = _listVirtualSpaces;
module.exports.getVirtualSpace = _getVirtualSpace;
module.exports.getCVO = _getCVO;



module.exports.listCOVs = _listCVOs;


module.exports.listAEResource = _listAEResource;
