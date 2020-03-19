(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('dashboardController', DashboardController)
  ;

/*
  "fas fa-chart-bar",
  "fas fa-chart-line",
  "fas fa-chart-pie",
  "fas fa-tachometer-alt",
  "fas fa-compass",
  "fas fa-map-marked",
  "fas fa-percent",
*/
  const WIDGET_TYPES = [
    // {
    //   "name": "Bar",
    //   "typeId": "bar-chart",
    //   "icon": "fas fa-chart-bar"
    //   "width": 2,
    //   "height": 1,
    //   "data-type": ["guage-type"]
    // },
    // {
    //   "name": "Donut",
    //   "typeId": "donut-chart",
    //   "icon": "fas fa-dot-circle"
    //   "width": 1,
    //   "height": 1,
    //   "data-type": ["guage-type"]
    // },
    {
      "name": "Gauge",
      "typeId": "gauge",
      "icon": "fas fa-tachometer-alt",
      "width": 1,
      "height": 1,
      "data-type": ["guage-type"]
    },
    // {
    //   "name": "Line",
    //   "typeId": "line-chart",
    //   "icon": "fas fa-chart-line",
    //   "width": 2,
    //   "height": 1,
    //   "data-type": ["guage-type"]
    // },
    // {
    //   "name": "PIE",
    //   "typeId": "pie-chart",
    //   "icon": "fas fa-chart-pie",
    //   "width": 1,
    //   "height": 1,
    //   "data-type": ["guage-type"]
    // },
    {
      "name": "Value list",
      "typeId": "value-list",
      "icon": "fas fa-list-alt",
      "width": 1,
      "height": 1,
      "data-type": ["guage-type"]
    }
  ];


  function _randomSelect(ary) {
    return ary[parseInt(Math.random() * ary.length - 0.5)];
  }
  function testWidgetData(widgetName) {
    switch(widgetName) {
      case 'visitors':
        break;

      case 'warnings':
        break;


      case 'gauge':
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
    var TEST_TEMPLATES = [
      {
        widgetType: 'visitors',
        title: 'Site visitors'
      },
      {
        widgetType: 'warnings',
        title: 'Warnings'
      },
      {
        widgetType: 'gauge',
        title: 'Memory load'
      },
      {
        widgetType: 'value-list',
        title: 'Value list'
      },
      {
        widgetType: 'line',
        title: 'Performance'
      }
    ];


    var selected = _randomSelect(TEST_TEMPLATES);
    selected = JSON.parse(JSON.stringify(selected));

    selected.widgetData = testWidgetData(selected.widgetType);

    return selected;

  }


  function WidgetCreateDialog($scope, $mdDialog) {

    $scope.WIDGET_TYPES = WIDGET_TYPES;

    $scope.widgetInfo = {
      "widgetType": "gauge",
      'title': "New widget",
      'width': 1, 
      'height': 1,
      'workspace': null
    };


    $scope.sizeButtonPosition = {
      row: 0,
      col: 0
    };

    var originatorEv = null;
    $scope.openSizeSelectionMenu = function($mdMenu, ev) {
      $scope.sizeButtonPosition = {
        row: $scope.widgetInfo.width,
        col: $scope.widgetInfo.height
      };

      originatorEv = ev;
      $mdMenu.open(ev);
    };

    $scope.getSizeButtonHoverClass = function(row, col) {
      var result = [];

      if($scope.widgetInfo && $scope.widgetInfo.height && $scope.widgetInfo.width) {
        if(row == $scope.widgetInfo.height && col == $scope.widgetInfo.width)
          result.push('current');
      }

      if(row <= $scope.sizeButtonPosition.row && col <= $scope.sizeButtonPosition.col)
        result.push('mouseover');
      
      return result;
    };
    
    $scope.onMouseoverSizeButton = function(row, col) {
      $scope.sizeButtonPosition = {
        row: row,
        col: col
      };
    };
    $scope.onMouseoverSizeButton = function(row, col) {
      $scope.sizeButtonPosition = {
        row: row,
        col: col
      };
    };
    $scope.onClickSizeButton = function(row, col) {
      $scope.widgetInfo.width = col;
      $scope.widgetInfo.height = row;
    };




    $scope.close = function() {
      $mdDialog.hide(null);
    };

    $scope.create = function() {
      
      if(!$scope.widgetInfo.widgetType) {
        alert('위젯 유형을 선택하세요')

        return;
      }

      $mdDialog.hide($scope.widgetInfo);
    };
  }





  DashboardController.$inject = ['$scope', '$rootScope', '$state', '$mdDialog', 'apiService', 'notificationService' ];

  function DashboardController($scope, $rootScope, $state, $mdDialog, apiService, notificationService) {


    $scope.WIDGET_TYPES = WIDGET_TYPES;
    $scope.widgetList = [];




    $scope.init = function() {

      apiService.widget.list()
        .then(function(widgetList){
          $scope.$apply(function(){

            widgetList.map(function(widget){
              switch(widget.widgetType) {
                case 'line': 
                widget.rowspan = 2;
                widget.colspan = 2;
                  break; 

                case 'visitors': 
                case 'value-list': 
                widget.rowspan = 2;
                widget.colspan = 1;
                  break; 

                case 'gauge': 
                widget.rowspan = 1;
                widget.colspan = 1;
                  break; 

                default: 
                  widget.rowspan = 1;
                  widget.colspan = 2;
                  break;
              }

              if(widget.width)
                widget.colspan = widget.width;
              if(widget.height)
                widget.rowspan = widget.height;


            });


            $scope.widgetList = widgetList;

          });
        });



      notificationService.on($scope, 'widgetdata.updated', function(evt, data){
        var widgetId = data['widgetId'];
        var widgetData = data['widgetData'];


        $scope.$apply(function(){
          $scope.widgetList.map(function(widget){
            try {
              if(widget.widgetId == widgetId) {
                if(widget.widgetType == 'warnings' || widget.widgetType == 'line' ) {
                  var itemData = {x: widget.widgetData.length, y: parseInt(widgetData)}
                  widget.widgetData.push(itemData);
                }
                else if(widget.widgetType == 'value-list') {
                  widget.widgetData = widgetData;
                }
                else
                  widget.widgetData = widgetData;
              }
            }
            catch(ex) {

            }
            
          });
        });
      });
    };


    

    var originatorEv;
    $scope.openCreateWidgetMenu = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };

    $scope.createNewWidget = function(typeId) {
      $state.go('edit-widget', {'mode': 'create', 'widgetId': null, 'widgetType': typeId});
    }

    $scope.editWidget = function(widget) {
      $state.go('edit-widget', {'mode': 'edit', 'widgetId': widget.widgetId, 'widgetType': widget.widgetType});
    }


    
    $scope.showCreateWidgetPopup = function() {

      $mdDialog.show({
        controller: WidgetCreateDialog,
        templateUrl: 'app/dashboard/modal.widget.create.html',
        parent: angular.element(document.body),
        clickOutsideToClose:false,
        locals: {
        }
      })

      .then(function(widgetInfo){
        if(widgetInfo) {
          apiService.widget.create(widgetInfo)
            .then(function(widget){
              $scope.$apply(function(){
                $scope.widgetList.push(widget);
              });
            });
        }
      });  
  
    };

    $scope.onDropComplete = function(dropIndex, dragObj, evt) {
      var dropObj = $scope.widgetList[dropIndex];
      var dragIndex = $scope.widgetList.indexOf(dragObj);

      $scope.widgetList[dropIndex] = dragObj;
      $scope.widgetList[dragIndex] = dropObj;

      var widgetIds = [];
      $scope.widgetList.map(function(item){
        widgetIds.push(item.widgetId);
      });
      apiService.widget.order(widgetIds)
      .then(function(widgetDeleted){
       
      });

    }


    $scope.deleteWidget = function(widget) {

      if(confirm("삭제된 위젯은 복구할 수 없습니다. 삭제하시겠습니까?")) {
        apiService.widget.delete(widget.widgetId)
        .then(function(widgetDeleted){
          $scope.$apply(function(){
            var index = $scope.widgetList.indexOf( widget );

            $scope.widgetList.splice(index, 1);
          });
        });
      }
    }
  }

})();
