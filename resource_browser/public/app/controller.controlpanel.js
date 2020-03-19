(function(){
  'use strict';


  angular
    .module('onem2mResourceMonitor')
    .controller('controlPanelController', ControlPanelController);


    //  controller inject
    ControlPanelController.$inject = ['$scope', '$rootScope', '$stateParams', 'store', 'resmonService', 'eventService'];


    /**
     * [ControlPanelController description]
     * @param {[type]} $scope        [description]
     * @param {[type]} resmonService [description]
     *
     *
     * View 생성 및 UI control event 처리 
     *   onem2m server와의 통신은 onem2mService에 deligate
     *   resource monitor server와의 통신은 resmonService에 deligate 
     */
    function ControlPanelController($scope, $rootScope, $stateParams, store, resmonService, eventService) {


      //
      //  scope functions 
      //  
      //////////////////////////////
      $scope.init = initScope;
      $scope.onStartStopButtonClicked = onStartStopButtonClicked;
      $scope.onChangeNumberOfInstances = onChangeNumberOfInstances;
      $scope.onChangeAnimation = onChangeAnimation;
      $scope.onResourceHostChanged = onResourceHostChanged;
      $scope.toggleControlPanel = toggleControlPanel;

      $scope.resourceHostFilter = resourceHostFilter;
      $scope.resourcePathFilter = resourcePathFilter;

      $scope.collapsed = false;

      $scope.monitorId = $stateParams.monitorId;
      $scope.animation = null;


      //
      //  implements functions 
      //
      /////////////////////////////////
      function initScope() {
        $scope.state = 'stopped';
          $scope.startstopChecked = false;
          $scope.startstopDisabled = false;


        $scope.resourceUrl = store.get('resourceUrl');

        $scope.resourceHost = store.get('resourceHost');
        if($scope.monitorId)
          $scope.resourcePath = store.get('resourcePath:'+$scope.monitorId);
        else
          $scope.resourcePath = store.get('resourcePath');

        if( !$scope.resourceHost )
          $scope.resourceHost = 'http://203.253.128.161:7579';
        if( !$scope.resourcePath )
          $scope.resourcePath = '/Mobius/justin';


        $scope.mqttBrokerIp = store.get('mqttBrokerIp');
        $scope.numberOfInstances = store.get('numberOfInstances');
        $scope.animation = store.get('animation');
        $scope.resourceUrlList = store.get('resourceUrlList');
        if( $scope.resourceUrlList == null )
          $scope.resourceUrlList = [];

        $scope.resourceHostList = store.get('resourceHostList');
        if( $scope.resourceHostList == null )
          $scope.resourceHostList = [];
        var defaultHostList = ['http://203.253.128.161:7579'];
        defaultHostList.map(function(item){
          if($scope.resourceHostList.indexOf(item) == -1)
            $scope.resourceHostList.push(item);
        });

        $scope.resourcePathList = store.get('resourcePathList');
        if( $scope.resourcePathList == null )
          $scope.resourcePathList = ['/Mobius/justin'];




        if( $scope.numberOfInstances == null )
          $scope.numberOfInstances = 3;

        //
        //  register event listeners
        //  
        ///////////////////////////
        eventService.on($rootScope, 'monitoring.statechanged', monitoringStateChangedHandler);
      }


      function toggleControlPanel(forceOpen) {
        setTimeout(function(){
          if(forceOpen)
            $('#control-panel').removeClass('collapsed');
          else
            $('#control-panel').toggleClass('collapsed');
        }, 100);
      }

      function onStartStopButtonClicked() {

        if( $scope.state == 'stopped' ) {


          //  check input value validation
          if( validateInputValues($scope) ) {
            saveConnectionInfo();

            var args ={
            userId : 'mobiususer02',
              resourceUrl : $scope.resourceUrl,
              mqttBrokerIp : $scope.mqttBrokerIp,
              numberOfInstances : $scope.numberOfInstances,
              animation : $scope.animation
            };

            eventService.emit($rootScope, 'monitoring.start', args);
            console.log( "monitoring.start messge emitted" ); 
          }
          else {
            eventService.showNoti('The given "Resource Path" is not allowed');
          }
        }
        else {
          eventService.emit($rootScope, 'monitoring.stop', null);
        }
      };


      function onChangeNumberOfInstances(value) {
        resmonService.setInstanceDisplayCount(value);
        store.set('numberOfInstances', value);
      }

      function onChangeAnimation($event){
        resmonService.setAnimation($scope.animation);
        store.set('animation', $scope.animation);
      }

      // 
      // check input values
      // 
      ///////////////////////////////////////////
      function validateInputValues(scope) {

        if(scope.resourcePath == null)
          scope.resourcePath = scope.searchText;
        if(scope.resourceHost == null)
          scope.resourceHost = scope.searchHostText;

        scope.resourceHost = scope.resourceHost.removeTailingSlash();

        scope.resourceUrl = scope.resourceHost + scope.resourcePath;


        var monitoringTarget = OneM2M.Util.getAccessPointInfo(scope.resourceUrl);
        if( !monitoringTarget || monitoringTarget.aryPaths.length < 2 ) {

          return false; 
        }

        $scope.mqttBrokerIp = monitoringTarget.hostname;
        return true;
      }

      //
      //  event handler function to handle Start/Stop button
      //  
      ////////////////////////
      function monitoringStateChangedHandler(event, state) {

        if(state == 'starting')
          eventService.showWaitforDialog();
        else
          eventService.hideWaitforDialog();


        console.log( 'MONITORING STATE CHANGED from ' + $scope.state + ' to ' + state ); 
        switch( state ) {
        case 'stopped':
          $scope.startstopChecked = false;
          $scope.startstopDisabled = false;
          break;
        
        case 'starting':
          $scope.startstopChecked = false;
          $scope.startstopDisabled = true;
          break; 

        case 'started':
          $scope.startstopChecked = true;
          $scope.startstopDisabled = false;

          toggleControlPanel();

          break;

        default:
          throw new Error( "unknown monitoring state : " + state );
        }

        $scope.state = state;


//        $scope.$apply();

        var phase = $scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest')
          $scope.$eval();
        else
          $scope.$apply();


      }


      function updateAndSaveArrayValue(key, array, updateValue, fixedCount) {

        var insertPosition = (fixedCount ? fixedCount : 0);
        var indexOf = array.indexOf( updateValue );
        //  -1 : new value를 0 index에 추가
        //  1 ~ : indexOf에 있는 값을 삭제하고 new value를 0 index에 추가
        //  0 : no op


        if( indexOf > insertPosition ) {
          array.splice(indexOf, 1);
        }

        if( indexOf == -1 || indexOf > insertPosition ) {
          array.splice(insertPosition, 0, updateValue);
        }

        if( array.length > 10 )
          array.splice(10, 100);

        store.set(key, array);
      }

      function saveConnectionInfo() {
        store.set('resourceUrl', $scope.resourceUrl);
        store.set('resourceHost', $scope.resourceHost);
        if($scope.monitorId)
          store.set('resourcePath:'+$scope.monitorId, $scope.resourcePath);
        else
          store.set('resourcePath', $scope.resourcePath);
        store.set('mqttBrokerIp', $scope.mqttBrokerIp);
        store.set('numberOfInstances', $scope.numberOfInstances);
        store.set('animation', $scope.animation)

        updateAndSaveArrayValue("resourceUrlList", $scope.resourceUrlList, $scope.resourceUrl);
        updateAndSaveArrayValue("resourceHostList", $scope.resourceHostList, $scope.resourceHost, 2);
        updateAndSaveArrayValue("resourcePathList", $scope.resourcePathList, $scope.resourcePath);
      }

      function onResourceHostChanged(resourceHost) {
        $scope.resourceHost = resourceHost;
      }

      function resourceHostFilter(keyword) {

        var lowcaseFilter = angular.$$lowercase(keyword);

        return $scope.resourceHostList.filter(function(item){

          var result = (angular.$$lowercase(item).indexOf(lowcaseFilter) != -1);
          if(!result) {
            console.log(angular.$$lowercase(item), lowcaseFilter,  angular.$$lowercase(item).indexOf(lowcaseFilter));
          }


          return (result);
        });
      }

      function resourcePathFilter(keyword) {

      }

    };


})();
