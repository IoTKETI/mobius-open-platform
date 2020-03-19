(function(){
  'use strict';

  var MAX_ZOOM_SCALE = 8;
  var MIN_ZOOM_SCALE = 0.4;

  var resourceMonitor = {
    monitoringTarget: null,
    mqttBrokerUrl: null,
    resourceMonitorAE: null,
    acpOrigin: null,
    instanceCountLimit: 1
  };

  angular
    .module('onem2mResourceMonitor')
    .controller('resourceTreeController', ResourceTreeController);

    ResourceTreeController.$inject = ['$scope', '$rootScope', '$mdDialog', 'store', 'onem2mService', 'resmonService', 'eventService', 'ModalService'];


    /**
     * [ResourceTreeController description]
     * @param {[type]} $scope        [description]
     * @param {[type]} onem2mService [description]
     *
     *
     * View 생성 및 UI control event 처리 
     *   onem2m server와의 통신은 onem2mService에 deligate
     *   resource monitor server와의 통신은 resmonService에 deligate 
     */
    function ResourceTreeController($scope, $rootScope, $mdDialog, store, onem2mService, resmonService, eventService, ModalService) {
      var diagonal, svg;
      var i = 0,
          duration = 150; // Branch 확장 애니메이션
      var newWidth, newHeight;

      var addTo = null
      var root = null;

      $scope.tree = null;
      $scope.zoomScale = 1;

      $scope.showPanel = true;
      $scope.currentSelectedResourceData = null;

      $scope.selectedResourceList = [];

      //
      //  scope functions 
      //  
      //////////////////////////////
      $scope.init = initScope;
      $scope.toggleShowHide = toggleShowHide;


      $scope.zoomIn = zoomIn;
      $scope.zoomReset = zoomReset;
      $scope.zoomOut = zoomOut;

      $scope.canZoomIn = canZoomIn;
      $scope.canZoomReset = canZoomReset;
      $scope.canZoomOut = canZoomOut;

      $scope.closePropertyPopup = closePropertyPopup;
      $scope.deleteResource = deleteResource;
      $scope.propertyPopupPosition = propertyPopupPosition;
      $scope.propertyPopupIcon = propertyPopupIcon;
      $scope.propertyPopupClass = propertyPopupClass;

      //
      //  implements functions 
      //
      /////////////////////////////////



      function canZoomIn() {
        if($scope.zoom == undefined)
          return true;

        if($scope.zoom.scale() >= MAX_ZOOM_SCALE)
          return true;
        else
          return false;
      }

      function canZoomReset() {
        if($scope.zoom == undefined)
          return true;

        if($scope.zoom.scale() == 1)
          return true;
        else
          return false;
      }

      function canZoomOut() {
        if($scope.zoom == undefined)
          return true;

        if($scope.zoom.scale() <= MIN_ZOOM_SCALE)
          return true;
        else
          return false;
      }

      function zoomIn() {
        zoomClick(1);
      }

      function zoomOut() {
        zoomClick(-1);
      }

      function zoomReset() {
        zoomClick(0);
      }


      function closePropertyPopup(resourceData) {
        var index = $scope.selectedResourceList.indexOf(resourceData);
        if(index != -1) {
          $scope.selectedResourceList.splice(index, 1);
          resourceData.setSelected(false);

          updateTree(resourceData);
        }
      }

      function _showDeleteResourcePopup(targetResource) {
        ModalService.showModal({
          templateUrl: './app/modal/delete.resource.html',
          controller: 'deleteResourceModalController',
          inputs: {
            resourceNode: targetResource
          }
        })
          .then(function(modal){
            modal.element.modal();
            modal.close.then(function(deleteInfo){
              if( deleteInfo ) {  //  result = resource id path
                if(deleteInfo.resourceId){
                  var resourceId = deleteInfo.resourceId;
                  var deleteOriginator = deleteInfo.deleteOriginator;
  
                  if( !resourceId.startsWith('/') )
                    resourceId = '/' + resourceId;
  
                  var resourceUrl = resourceMonitor.monitoringTarget.baseUrl
                    + resourceId;
                  var acpOrigin = resourceMonitor.acpOrigin;
                  if(deleteOriginator)
                    acpOrigin = deleteOriginator;
  
                  onem2mService.deleteResource(resourceUrl, acpOrigin)
                    .then(function(res){
  
                      var newResourceType = _.keys(res)[0];
                      var parentNode = resmonService.findNode(res[newResourceType].pi);
                      if( parentNode ) {
                        parentNode.removeChild(res[newResourceType].rn);
  
                        eventService.showNoti('Success to delete a resource');
                        updateTree(parentNode);
                      }
  
                    })
                    .catch(function(err){
                      eventService.showError(err);
  
                    });
                }else{
                  if(deleteInfo.message){
                    eventService.showError(deleteInfo.message);
                  }
                }
              }
            });
          })
          .catch(function(err) {
            eventService.showError(err);
          });
      }


      function deleteResource(resourceData) {

        var index = $scope.selectedResourceList.indexOf(resourceData);
        if(index != -1) {
          $scope.selectedResourceList.splice(index, 1);
          resourceData.setSelected(false);
          updateTree(resourceData);
        }

        _showDeleteResourcePopup(resourceData);
      }

      function propertyPopupPosition(resourceData) {
        if(resourceData && resourceData.ppx && resourceData.ppy) {
          return {
            left: resourceData.ppx + 'px',
            top: resourceData.ppy + 'px'
          };
        }

        else {
          return {};
        }
      }

      function propertyPopupIcon(resourceData) {
        if(resourceData) {

          var backgroundColor = getResourceColor(resourceData);
          var border = "2px solid white";
          if(resourceData.getTypeName() == 'cb') {
            backgroundColor = "white";
            border =  "2px solid " + getResourceColor(resourceData);
          }

          return {
            "background-image": 'url(' + getResourceIcon(resourceData) + ')',
            "background-color": backgroundColor,
            "border": border
          };
        }

        else {
          return {};
        }
      }


      function propertyPopupClass(resourceData) {
        if(resourceData && resourceData.data) {
          return resourceData.getTypeName();
        }

        else {
          return '';
        }
      }




      /**
       * [initScope description]
       * @return {[type]} [description]
       *
       * init scope and register event listeners 
       */
      function initScope() {

        //  register event listeners
        eventService.on($rootScope, 'monitoring.start', onMonitoringStartRequest);
        eventService.on($rootScope, 'monitoring.stop', onMonitoringStopRequest);
        eventService.on($rootScope, 'monitoring.get.resource', onGetResourceRequest);
        eventService.on($rootScope, 'monitoring.discover.resource', onDiscoverResourceRequest);
        eventService.on($rootScope, 'monitoring.delete.resource', onDeleteResourceRequest);
        eventService.on($rootScope, 'monitoring.update.resource', onUpdateResourceRequest);
        eventService.on($rootScope, 'monitoring.update.animation', onUpdateAnimationEffect);
        eventService.on($rootScope, 'monitoring.created.resource', onCreateResourceRequest);



        setTimeout(function(){
          toggleShowHide();
        }, 3000);



        $scope.$on('$destroy', function(){ 
          eventService.emit($rootScope, 'monitoring.stop', null);

//          socket.disconnect();
        });  

      }


      function toggleShowHide() {
        $scope.showPanel = !$scope.showPanel;

        if( $scope.showPanel ) {
          $("#resource-tree-legend .legend-table-body").removeClass("collapsed");
        }
        else {
          $("#resource-tree-legend .legend-table-body").addClass("collapsed");
        }
      }


      function onUpdateResourceRequest(event, args) {
        if( args ) {
          updateTree(args);
        }
      }

      function onUpdateAnimationEffect(event, args){
          $scope.animation = args;
          duration = args ? 150 : 0;
      }

      function onCreateResourceRequest(event, args) {
        /*
          args = {
            'path': '/resource/path',
            'node': nodeObj,
            'update': boolean
          }
         */

        var aeName = resourceMonitor.resourceMonitorAE['m2m:ae']['rn'];
        var acpOrigin = resourceMonitor.acpOrigin;
        var subName = aeName + '_sub';

        var path = args.path;
        var node = args.node;
        var update = args.update;

        var typeCode = node.getTypeCode();
        switch( typeCode ) {
          case '2' : // ae
          case '3' : // container
          case '24' : // semantic descriptor
          case '25' : // timeseries

            var resourceUrl = resourceMonitor.monitoringTarget.baseUrl + path;
            onem2mService.subscribeTo(resourceUrl, subName, acpOrigin, resourceMonitor.mqttBorkerUrl)
              .then(function (res) {
                var subNode = resmonService.setNodeData(res, null, update);
              })
              .catch(function (err) {
              });

            break;

          case '4' : // content instance

            // var pathArray = path.split('/');
            // pathArray.pop();
            // var parentPath = pathArray.join('/');
            //
            // var resourceUrl = resourceMonitor.monitoringTarget.baseUrl + parentPath;
            // onem2mService.getResource(resourceUrl, acpOrigin)
            //   .then(function (res) {
            //     var parentNode = node.getParent();
            //     parentNode.setData( res );
            //
            //     if(update)
            //       updateTree(parentNode);
            //   })
            //   .catch(function (err) {
            //   });

        }

        if(update)
          updateTree(node);
      }


      /**
       * [onDiscoverResourceRequest description]
       * @param  {[type]} event [description]
       * @param  {[type]} args  [description]
       * @return {[type]}       [description]
       */
      function onDiscoverResourceRequest(event, args) {

        var resourceUrl = resourceMonitor.monitoringTarget.baseUrl + args.resourcePath;
        var node = args.node;
        var acpOrigin = resourceMonitor.acpOrigin;

        discoverChildResource(resourceUrl, node.getTypeName(), acpOrigin, node);
      }

      /**
       * [onGetResourceRequest description]
       * @param  {[type]} event [description]
       * @param  {[type]} args  [description]
       * @return {[type]}       [description]
       */
      function onGetResourceRequest(event, args) {
        /*
          args = '/resource/path';
         */

        var aeID = resourceMonitor.resourceMonitorAE['m2m:ae']['aei'];
        var aeName = resourceMonitor.resourceMonitorAE['m2m:ae']['rn'];
        var acpOrigin = resourceMonitor.acpOrigin;
        var subName = aeName + '_sub';

        var path = args.path;
        var update = args.update;

        var resourceUrl = resourceMonitor.monitoringTarget.baseUrl + path;
        onem2mService.getResource(resourceUrl, acpOrigin)
          .then(function(res){
            var node = resmonService.setNodeData(res, null, update);

            //  Subscribe if resource type is one of AE, Container and Timeseries
            var typeCode = node.getTypeCode();
            switch( typeCode ) {
              case '2' : // ae
              case '3' : // container
              case '24' : // semantic descriptor
              case '25' : // timeseries
                var offset = null;
                if(typeCode == '3' || typeCode == '25') {
                  var typeName = Object.keys(res)[0];
                  if(res[typeName] && res[typeName]['cni']) {
                    offset = parseInt(res[typeName]['cni']);
                    offset = Math.max(0, offset - 5);
                  }
                }
                
                onem2mService.subscribeTo(resourceUrl, subName, acpOrigin, resourceMonitor.mqttBorkerUrl)
                  .then(function(res){
                    var subNode = resmonService.setNodeData(res, null, update);

                    discoverChildResource(resourceUrl, node.getTypeName(), acpOrigin, node, offset);
                    //updateTree(node);

                  })
                  .catch(function(err) {

                    discoverChildResource(resourceUrl, node.getTypeName(), acpOrigin, node, offset);
                    //updateTree(node);

                  });

              default :
                updateTree(node);
            }
          })
          .catch(function(err) {
            console.log( 'fail to get resource' + resourceUrl );
            console.log( err );
            //  Unsubscribe

          });
      }

      /**
       * [onDeleteResourceRequest description]
       * @param  {[type]} event [description]
       * @param  {[type]} args  [description]
       * @return {[type]}       [description]
       */
      function onDeleteResourceRequest(event, args) {
        /*
          args = '/resource/path';
         */

        //  find parent node
        var targetNode = resmonService.findNode(args);
        var parentNode = targetNode.getParent();

        //  delete designated node
        parentNode.removeChild(targetNode.getName());

        //  update tree from parent node
        updateTree(parentNode);
 
      }


      function onMonitoringStopRequest(event, args) {
        //  reset diagram   t     
        d3.select("#resource-tree-view svg").remove();
         
        eventService.emit($rootScope, 'monitoring.statechanged', 'stopped');

        $scope.socket.close()

        $scope.selectedResourceList = [];

      } 

      /**
       * [onMonitoringStartRequest description]
       * @param  {[type]} event [description]
       * @param  {[type]} args  [description]
       * @return {[type]}       [description]
       *
       *  on requested to start monitoring 
       * 
       */
      function onMonitoringStartRequest(event, args) {
        /*
        var args ={
          userId : 'mobiususer01',
          resourceUrl : 'http://192.168.0.2:7579/mobius-yt/justin',
          mqttBrokerIp : '192.168.0.2',
          numberOfInstances : '3'
        };
        */
        resourceMonitor.resourceMonitorAE = {
          "m2m:ae": {
            "rn": args.userId + '.MOBIUS.BROWSER.WEB',
            "api": 'MOBIUS.BROWSER.WEB',
            "lbl": ['Mobius Resource Browser Web'],
            "rr": true
          }
        }

        resourceMonitor.monitoringTarget = OneM2M.Util.getAccessPointInfo(args.resourceUrl);
        resourceMonitor.targetResourceDepth = resourceMonitor.monitoringTarget.aryPaths.length;

        eventService.emit($rootScope, 'monitoring.statechanged', 'starting');



        resmonService.setInstanceDisplayCount(args.numberOfInstances);
        resmonService.setAnimation(args.animation);

        //  create or get AE info. and get AEID 
        createOrGetResourceMonitorAE(resourceMonitor.monitoringTarget, resourceMonitor.resourceMonitorAE)
          .then( function(aeObj) {

            var aeID = aeObj['m2m:ae']['aei'];
            if( !aeID || aeID.trim().length == 0 ) {
              //  resource monitoring을 위한 AE 생성/조회 실패
              console.log('failed to create or get resource monitoring AE. try to create AE but aeid is null');

              eventService.emit($rootScope, 'monitoring.statechanged', 'stopped');
              eventService.showError('대상 서버에 접속할 수 없습니다. (Failed to create browser AE resource)');

              return Promise.resolve(null);
            }
            else {

              // save resource monitor AE object
              resourceMonitor.resourceMonitorAE = aeObj;

              var aeName = aeObj['m2m:ae']['rn'];
              var subName = aeName + '_sub';
              var acpOrigin = resourceMonitor.acpOrigin = aeID;

              //  check rexource is effective
              var resourceUrl = resourceMonitor.monitoringTarget.baseUrl
                              + resourceMonitor.monitoringTarget.path;


              getBaseAEResource(resourceUrl, acpOrigin)
              //onem2mService.getResource(resourceUrl, origin)
                .then(function(res){

                  //  getBaseAEResource() 내부에서 resourceMonitor.acpOrigin의 값이 변경될 수 있기 때문에
                  acpOrigin = resourceMonitor.acpOrigin;

                  //  connect realtime monitoring channel
                  var socket = io.connect(window.location.origin, {path: window.location.pathname + 'socket.io'});
                  $scope.socket = socket;
                  socket.on('connected', function (data) {
                    var mqttAddress = args.mqttBrokerIp;
                    if(!mqttAddress.startsWith('mqtt://'))
                      mqttAddress = 'mqtt://' + args.mqttBrokerIp;

                    resourceMonitor.mqttBorkerUrl = mqttAddress;

                    //socket.emit('start', {to: mqttAddress, path: resourceMonitor.monitoringTarget.path, aeId: resourceMonitor.resourceMonitorAE['m2m:ae']['aei']});
                    socket.emit('start', {to: mqttAddress, path: resourceMonitor.monitoringTarget.path, aeId: acpOrigin});
                  });


                  socket.on('mqtt:notification', function(data) {

                    //  process notification operation
                    //  
                    //  {
                    //    "notiEventType": "1",
                    //    "primitiveContent":{
                    //      "sgn":{ //  notification
                    //        "net":"1",
                    //        "sur":"/mobius-yt/justin/ss/cmobiususer02.MOBIUS.BROWSER.WEB_sub",
                    //        "nev":{ //  notification event 
                    //          "rep":{ //  representation
                    //            "cnt":{ //  content 
                    //              "pi":"/mobius-yt/justin",
                    //              "ty":"3",
                    //              "ct":"20160902T082402",
                    //              "ri":"/mobius-yt/justin/ss",
                    //              "rn":"ss",
                    //              "lbl":[
                    //                "heartbeat1"
                    //              ],
                    //              "lt":"20161019T073010",
                    //              "st":"16",
                    //              "mni":"100"
                    //            }
                    //          }
                    //        }
                    //      }
                    //    }
                    //  }
                    
                    //  notification event type
                    //    1: Update of resource
                    //    2: Delete of resource
                    //    3: Create of direct child resource
                    //    4: Delete of direct child resource
                    try {
                      var sgn = data.primitiveContent['sgn'] || data.primitiveContent['m2m:sgn'];
                      var representation = sgn.nev.rep;
                      var resourceType = _.keys(representation)[0];
                      var arySur = ('/' + sgn.sur).split('/');
                      //  thkim unstructured ri 적용

                      var notiEventType = data.notiEventType;

                      switch(notiEventType) {
                        case 1 : // update of resource
                        case '1' : // update of resource
                          var eventNodeId = arySur.splice(0, arySur.length-1).join('/');
                          var eventNode = resmonService.findNode(eventNodeId);
                          if(eventNode) {
                            eventNode.setData(representation, true);
                            eventService.emit($rootScope, 'monitoring.update.resource', eventNode);
                          }
                          break;

                        case 2 : // delete of resource
                        case '2' : // delete of resource
                          var eventNodeId = arySur.splice(0, arySur.length-1).join('/');
                          var eventNode = resmonService.findNode(eventNodeId);
                          if(parentNode) {
                            parentNode.removeChild(representation[resourceType].rn);

                            eventService.emit($rootScope, 'monitoring.update.resource', parentNode);
                          }
                          break;

                        case 3 : // create of direct child resource
                        case '3' : // create of direct child resource
                          var eventNodeId = arySur.splice(0, arySur.length-1).join('/');
                          var parentNode = resmonService.findNode(eventNodeId);
                          if(parentNode) {
                            //  noti message에서 rn 이 "@"로 들어오는 경우에 대한 방어코드
                            var rn = representation[resourceType].rn;
                            if(!rn && representation[resourceType]['@'])
                              rn = representation[resourceType]['@']['rn'];

                            var newNode = parentNode.appendChild(rn);
                            newNode.setData(representation, true);

                            var param = {
                              'path': eventNodeId + '/' + newNode.getName(),
                              'node': newNode,
                              'update': true
                            };
                            eventService.emit($rootScope, 'monitoring.created.resource', param);
                          }
                          break;

                        case 4 :  //  deletion of direct child resource
                        case '4' :  //  deletion of direct child resource
                          var eventNodeId = arySur.splice(0, arySur.length-1).join('/');
                          var parentNode = resmonService.findNode(eventNodeId);
                          if(parentNode) {
                            parentNode.removeChild(representation[resourceType].rn);
                            eventService.emit($rootScope, 'monitoring.update.resource', parentNode);
                          }
                          break;
                      }

                    }
                    catch( e ) {
                      console.log( e );
                    }
                  });



                  console.log( 'check wether given resource path is valid or not: valid' );

                  resmonService.initResourceTree(resourceMonitor.monitoringTarget.path);



                  //  get base resources
                  getBaseResources(resourceMonitor.monitoringTarget, resourceMonitor.resourceMonitorAE)
                    .then(function(baseResources) {
                      //  base resources
                      var baseNode = null;
                      for( var i=0; i < baseResources.length; i++ ) {
                        baseNode = resmonService.setNodeData(baseResources[i]);

                        if(i != baseResources.length -1)
                          baseNode.setDiscovered(true);
                      }

                      var subTargetUrl = resourceMonitor.monitoringTarget.baseUrl + resourceMonitor.monitoringTarget.path;
                      onem2mService.subscribeTo(subTargetUrl, subName, acpOrigin, resourceMonitor.mqttBorkerUrl)
                        .then(function(subsRes) {
                          var subNode = resmonService.setNodeData(subsRes);
                        })
                        .catch(function(err) {
                          // no op
                        });


                      initDemoTree();

                      //
                      var expandNode = baseNode;
                      while(expandNode){
                        expandNode.expand();

                        expandNode = expandNode.getParent();
                      }


//                      discoverChildResource(subTargetUrl, baseNode.getTypeName(), acpOrigin, baseNode);

                      eventService.emit($rootScope, 'monitoring.statechanged', 'started');
                    })
                    .catch(function(err) {
                      console.log( 'failed to get base resources', err );

                      eventService.emit($rootScope, 'monitoring.statechanged', 'stopped');
                      eventService.showError('failed to get base resources');
                    });


                }, function(err) {
                  eventService.emit($rootScope, 'monitoring.statechanged', 'stopped');
                  console.error(err);
                  eventService.showError(err);
                })
                .catch(function(err){
                  //  TODO thyun  popup error dialog. given resource path is not valid 
                  console.log( 'failed to get resource monitoring AE' );

                  eventService.emit($rootScope, 'monitoring.statechanged', 'stopped');
                  eventService.showError('failed to get resource monitoring AE');
                });


            }



          })
          .catch( function(err) {
            //  resource monitoring을 위한 AE 생성/조회 실패 
            console.log( 'failed to create or get resource monitoring AE. try to create AE but aeid is null' );

            eventService.emit($rootScope, 'monitoring.statechanged', 'stopped');          
            eventService.showError('대상 서버에 접속할 수 없습니다. (Failed to create browser AE resource)');
          });


        setTimeout( function() {
//          eventService.emit($rootScope, 'monitoring.statechanged', 'started');
        }, 1000 );
        //eventService.emit($rootScope, 'monitoring.statechanged', 'started');

      };

      function getBaseAEResource(resourcePath, origin) {
        return new Promise(function(resolve, reject) {
          onem2mService.getResource(resourcePath, origin)
            .then(
              //  success handler for get resource
              function(res){
                resolve(res);
              },

              //  fail handler for get resource
              function(err){
                if(err.status == '403' || err.statusCode == '403') {
                  eventService.showError('ACCESS DENIED');

                  ModalService.showModal({
                    templateUrl: './app/modal/input.acpname.html',
                    controller: 'inputAcpnameModalController',
                    inputs: {
                      acpName: origin
                    }
                  })
                    .then(function(modal){
                      modal.element.modal();
                      modal.close.then(function(acpName){

                        if( acpName ) {


                          setTimeout(function(){
                            resourceMonitor.acpOrigin = acpName.trim();

                            getBaseAEResource(resourcePath, resourceMonitor.acpOrigin)
                              .then(function(res){
                                resolve(res);
                              }, function(err){
                                reject(err);
                              });
                          }, 100);

                        }
                        else {
                          reject(err);
                        }
                      })
                    });
                }
                else {
                  reject(err);
                }
              }
            );


        });
      }



      /**
       * [createOrGetResourceMonitorAE description]
       * @param  {[type]} target [description]
       * @param  {[type]} ae     [description]
       * @return {[type]}        [description]
       *
       * create or get resource monitor AE
       */
      function createOrGetResourceMonitorAE(target, ae) {

        return new Promise(function(resolve, reject){

          //  try to get resource info
          var parentResourcePath = target.baseUrl + '/' + target.cseName;
          var origin = 'S'; // AE 생성 시 origin을 "S"로 하여 Service domain에서 할당받기 위함 

          //  try to create resource monitor AE resource
          onem2mService.createResource(parentResourcePath, ae, origin)
            .then(function(monitorAERes){

              //  success to create resource monitor AE 
              //  check aeid
              var aeID = monitorAERes['m2m:ae']['aei'];
              if( aeID && aeID.trim().length > 0 ) {

                resolve(monitorAERes); 

              }
              else {

                //  if aeid is invalid, then query resource info
                var resourceUrl = parentResourcePath + '/' + ae['m2m:ae']['rn'];
                var cseOrigin = "/" + target.cseName;  //  AE가 생성되었지만 아직 aei를 알지 못하는 상태기 때문에 origin을 CSE로 하여 조회 
                onem2mService.getResource(resourceUrl, cseOrigin)
                  .then(function(monitorAERes){

                    resolve( monitorAERes );

                  })
                  .catch(function(err){
                    reject( err );
                  });
              }
            })
            .catch(function(err){

              //  Conflicted - because aleady exist
              if( err.status == '409' || err.statusCode == '409' ) {
                //  get AE resource info 
                var resourceUrl = parentResourcePath + '/' + ae['m2m:ae']['rn'];
                var cseOrigin = "/" + target.cseName;  //  AE가 생성되었지만 아직 aei를 알지 못하는 상태기 때문에 origin을 CSE로 하여 조회 
                onem2mService.getResource(resourceUrl, cseOrigin)
                  .then(function(monitorAERes){

                    resolve( monitorAERes );
                  })
                  .catch(function(err){
                    reject(err);
                  });
              }
              else {
                reject(err);
              }
            }); 

        });

      }


      /**
       * [getBaseResources description]
       * @param  {[type]} target [description]
       * @param  {[type]} ae     [description]
       * @return {[type]}        [description]
       *
       * get base resources 
       */
      function getBaseResources(target, ae) {

        return new Promise(function(resolve, reject){

          //  try to get resource info
          var getResourceWork = [];

          var resourceUrl = target.baseUrl;
          var acpOrigin = resourceMonitor.acpOrigin;

          for(var i=0; i < target.aryPaths.length; i ++) {
            resourceUrl = resourceUrl + '/' + target.aryPaths[i];

            getResourceWork.push( onem2mService.getResource(resourceUrl, acpOrigin));
          }


          try {
            Promise
              .all(getResourceWork)
              .then(function (resources) {
                resolve(resources);

              }, function (reason) {
                console.log(reason)

                reject(reason);
              });
          }
          catch( e ) {
            console.log( e );
          }
        });
      }


      function discoverChildResource(resourceUrl, parentType, origin, node, offset) {

        eventService.showWaitforDialog();

        var aeName = resourceMonitor.resourceMonitorAE['m2m:ae']['rn'];
        var subName = aeName + '_sub';
        onem2mService.subscribeTo(resourceUrl, subName, origin, resourceMonitor.mqttBorkerUrl)
          .then(function(subsRes) {
            var subNode = resmonService.setNodeData(subsRes);
          })
          .catch(function(err) {
            // no op
          });


        onem2mService.discoverResource(resourceUrl, parentType, origin, undefined, 5, offset) //  5 는 화면에 보여줄 최대 CIN의 갯수
          .then(function(res){

            res.map(function(item){
              var typeName = Object.keys(item)[0];
              var resourceName = item[typeName]['rn'];
              var child = node.appendChild(resourceName);
              child.setData(item);
            });

            if(node) {
              node.setDiscovered(true);
              node.expand();
              updateTree(node, true);
            }

            eventService.hideWaitforDialog();
          })
          .catch(function(err){
            if(node) updateTree(node);

            eventService.hideWaitforDialog();
          }); 
      }


      function createContainer() {
        return new Promise(function(resolve, reject){

          //  try to get resource info
          var parentResourcePath = target.baseUrl + '/' + target.cseName;
          var acpOrigin = resourceMonitor.acpOrigin;

          //  try to create resource monitor AE resource
          onem2mService.createResource(parentResourcePath, ae, acpOrigin)
            .then(function(res){

              //  success to create resource monitor AE 
              //  check aeid
              var aeid = res['m2m:ae']['aei'];
              if( aeid && aeid.trim().length > 0 ) {

                resolve(res); 

              }
              else {

                //  if aeid is invalid, then query resource info
                var resourceUrl = parentResourcePath + '/' + ae['m2m:ae']['rn'];
                onem2mService.getResource(resourceUrl, acpOrigin)
                  .then(function(res){

                    resolve( res );

                  })
                  .catch(function(err){
                    reject( err );
                  });
              }
            })
            .catch(function(err){

              //  Conflicted - because already exist
              if( err.status == '409' || err.statusCode == '409' ) {
                //  get AE resource info 
                var resourceUrl = parentResourcePath + '/' + ae['m2m:ae']['rn'];
                onem2mService.getResource(resourceUrl, acpOrigin)
                  .then(function(res){

                    resolve( res );
                  })
                  .catch(function(err){
                    reject(err);
                  });
              }
              else {
                reject(err);
              }
            }); 

        });
 
      }


      var getNodeChildren = function(node) {
        if( !node || !node.children )
          return [];

        var typeCode = node.getTypeCode();
        var instanceTypeCode = '';

        switch( typeCode ) {
          case '3' :
            instanceTypeCode = "4";
            break;

          case '25' :
            instanceTypeCode = "26";
            break;
        }

        if( instanceTypeCode != '' ) {
          //  current node가 CNT와 TS인 경우 child 중에서 CI와 TSI를 5개까지만 유지
          var nInstanceCount = 0;
          var children = [];
          for(var i=0; i < node.aryChildren.length; i++) {
            if( node.aryChildren[i].getTypeCode() == instanceTypeCode ) {


              nInstanceCount ++;
              if( nInstanceCount  <=  resmonService.getInstanceDisplayCount() ) {
                children.push( node.aryChildren[i] );
              }
            }
            else {
              children.push(node.aryChildren[i]);
            }
          }

          return children;
        }
        else {
          return node.children;
        }
      }


      function zoomed() {

        if(d3.event && d3.event.type == 'zoom')
          return;

        if($scope.zoom.scale() < MIN_ZOOM_SCALE) {
          $scope.zoom.scale(MIN_ZOOM_SCALE);
          return;
        }

        if($scope.zoom.scale() > MAX_ZOOM_SCALE) {
          $scope.zoom.scale(MAX_ZOOM_SCALE);
          return;
        }

        var translate = $scope.zoom.translate();
        translate[0] = Math.min(newWidth, Math.max(0, translate[0]));
        translate[1] = Math.min(newHeight, Math.max(1, translate[1]));
        $scope.zoom.translate(translate);

        setTimeout(function(){
          svg.attr("transform",
            "translate(" + $scope.zoom.translate() + ")" +
            "scale(" + $scope.zoom.scale() + ")"
          );

          $scope.zoomScale = $scope.zoom.scale();

          updateTree(root);

        }, 100);

      }

      function zoomClick(direction) {

        switch(direction) {
          case 0 :
            $scope.zoom.scale(1);
            zoomed();
            break;


          case 1 :
          case -1:
            var scale = $scope.zoom.scale();
            scale = scale + (direction * 0.2);
            $scope.zoom.scale(scale);
            zoomed();
        }
      }


      function initDemoTree() {

        d3.select("#resource-tree-view svg").remove();


        var margin = {top: 20, right: 120, bottom: 20, left: 120},
            width = 2000 - margin.right - margin.left,
            height = 1000 - margin.top - margin.bottom;
        var nodeWidth = 180, nodeHeight = 20;

        $scope.zoom = d3.behavior.zoom()
          .scaleExtent([0.3, 8])
          .on("zoom", zoomed);

        $scope.tree = d3.layout.tree()
            //.nodeSize([40, 200])
            .size([height, width])
          .children(function(d){
            return getNodeChildren(d);
          })

        ;

        diagonal = d3.svg.diagonal()
            .projection(function(d) { 
              return [d.y+nodeWidth, d.x+nodeHeight]; 
            });

        d3.select("#resource-tree-view").append("svg").remove();

        svg = d3.select("#resource-tree-view").append("svg")
            .on("dblclick", function(){
              let tag = d3.event.path[0].tagName;
              if(!(tag == 'rect' || tag == 'image' || tag =='text')){
                zoomIn();
                $scope.$apply();
              }
              d3.event.preventDefault();
            })
            .attr("class", "resource-tree")
//            .attr("overflow", "auto")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call($scope.zoom)
            .on("wheel.zoom", null)
            .on("dblclick.zoom", null);

        /*
        Drop shadow filter
        */
        // filters go in defs element
        var defs = svg.append("defs");

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filter = defs.append("filter")
            .attr("id", "dropshadow")
            .attr("width", "130%")
            .attr("height", "130%");

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");

        // translate output of Gaussian blur to the right and downwards with 2px
        // store result in offsetBlur
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");


        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filterBlur = defs.append("filter")
            .attr("id", "filter-blur")
            .attr("width", "130%")
            .attr("height", "130%");
            
        filterBlur.append("feGaussianBlur")
            .attr("stdDeviation", "1.1");



        root = resmonService.getRoot();
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
          d.collapse();
        }

        root.collapse();
        updateTree(root);

        //root = root;

        d3.select(self.frameElement).style("height", "800px").style("width", "1800px");


/*
        //  Tooltip text
        svg.append("rect")
          .attr("class", "tooltip-box")
          .attr("id", "tooltip-box")
          .attr("rx", 10)
          .style("fill", "white")
          .style("strok", "black")
          .style("strok-width", 1)
          .style("visibility", "hidden");

        svg.append("text")
          .attr("class", "tooltip-text")
          .attr("id", "tooltip-text")
          .style("visibility", "hidden");

*/

      }


      var NODE_COLORS = {
        "1": "rgb(177, 177, 177)", 
        "2": "rgb(95, 161, 55)", 
        "3": "rgb(253, 181, 10)", 
        "4": "rgb(148, 148, 148)", 
        "5": "rgb(103, 158, 198)", 
        "9": "rgb(91, 26, 143)", 
        "10": "rgb(177, 177, 177)", 
        "16": "rgb(177, 177, 177)", 
        "23": "rgb(53, 65, 87)", 
        "24": "rgb(230, 104, 38)", 
        "25": "rgb(53, 91, 183)", 
        "26": "rgb(75, 135, 203)", 
        "27": "rgb(177, 177, 177)", 
        "99": "rgb(177, 177, 177)" 
      };

      var NODE_ICONS = {
        "1": "icon_resource_unknown.png", 
        "2": "icon_resource_ae.png", 
        "3": "icon_resource_cnt.png", 
        "4": "icon_resource_cin.png", 
        "5": "icon_resource_cb.png", 
        "9": "icon_resource_grp.png", 
        "10": "icon_resource_unknown.png", 
        "16": "icon_resource_unknown.png", 
        "23": "icon_resource_sub.png", 
        "24": "icon_resource_sd.png", 
        "25": "icon_resource_ts.png", 
        "26": "icon_resource_tsi.png", 
        "27": "icon_resource_unknown.png", 
//        "99": "icon_resource_unknown.png", 
        "99": "loading_ani.gif", 
      };


      var menu = [
        {
          title: 'Create',
          disabledMask : 1,
          action: function(elm, d, i) {
            ModalService.showModal({
              templateUrl: './app/modal/create.resource.html',
              controller: 'createResourceModalController',
              inputs: {
                parentNode: d
              }
            })
            .then(function(modal){
              modal.element.modal();
              modal.close.then(function(result){

                if( result ) {
                  var parentData = result.parent.data;
                  var newResource = result.resource;

                  var resourceType = _.keys(parentData)[0];
                  //  thkim unstructured ri 적용
                  //var resourcePath = parentData[resourceType].pi + "/" + parentData[resourceType].rn;
                  var resourcePath = parentData[resourceType].ri;
                  if( !resourcePath.startsWith('/') )
                    resourcePath = '/' + resourcePath;

                  var resourceUrl = resourceMonitor.monitoringTarget.baseUrl
                                  + resourcePath;
                  var acpOrigin = resourceMonitor.acpOrigin;

                  onem2mService.createResource(resourceUrl, newResource, acpOrigin)
                    .then(function(res){
                      var newResourceType = _.keys(res)[0];
                      var newNode = result.parent.appendChild(res[newResourceType].rn);
                      newNode.setData(res, true);
                      updateTree(result.parent);

                      eventService.showNoti('Success to create a resource');
                      //  20170719 container 생성 후에 sub 안걸리는 오류 수정
                      //eventService.emit($rootScope, 'monitoring.get.resource', {path: '/' + res[newResourceType].pi + '/' + res[newResourceType].rn, update:false});
                      // eventService.emit($rootScope, 'monitoring.get.resource', {path: '/' + res[newResourceType].ri, update:false});
                    })
                    .catch(function(err){

                    }); 
                }
              })
            })
          }
        },
/*
        {
          title: '리소스 수정',
          action: function(elm, d, i) {
            ModalService.showModal({
              templateUrl: '/app/modal/update.resource.html',
              controller: 'updateResourceModalController',
              inputs: {
                resourceData: d
              }
            })
            .then(function(modal){
              modal.element.modal();
              modal.close.then(function(result){
                //alert( result );
              });
            });
          }
        },
*/
        {
          title: 'Delete',
          disabledMask : 2,
          action: function(elm, d, i) {

            _showDeleteResourcePopup(d);

          }
        },

        {
          title: 'Properties',
          disabledMask : 3,
          action: function(elm, d, i) {


            showResourcePropertyPanel()(d);


          //
          //   $mdDialog.show({
          //     controller: 'resourcePropertyDialogController',
          //     templateUrl: './app/modal/resource.property.dialog.html',
          //     parent: angular.element(document.body),
          //     //targetEvent: ev,
          //     clickOutsideToClose:true,
          //     locals : {
          //       resourceData: d.data
          //     }
          //   })
          //     .then(function(answer) {
          //       //$scope.status = 'You said the information was "' + answer + '".';
          //     }, function() {
          //       //$scope.status = 'You cancelled the dialog.';
          //     });
          }
        }
      ];

      var d3ContextMenu = function (menu, openCallback) {

        // create the div element that will hold the context menu
        d3.selectAll('.d3-context-menu').data([1])
          .enter()
          .append('div')
          .attr('class', 'd3-context-menu');

        // close menu
        d3.select('body').on('click.d3-context-menu', function() {
          d3.select('.d3-context-menu').style('display', 'none');
        });

        // this gets executed when a contextmenu event occurs
        return function(data, index) {  
          var elm = this;

          d3.selectAll('.d3-context-menu').html('');
          var list = d3.selectAll('.d3-context-menu').append('ul');

          /* for disabled function to menus's elements */
          var menuBitVector = getMenuBitVector(data);

          list.selectAll('li').data(menu).enter()
            .append('li')
            .html(function(d) {
              if(menuBitVector & (1 << d.disabledMask)){
                this.classList.add('menu-disabled');
              }
              return d.title;
            })
            .on('click', function(d, i) {
              if(!(menuBitVector & (1 << d.disabledMask))){
                d.action(elm, data, index);
                d3.select('.d3-context-menu').style('display', 'none');
              }
            });

          // the openCallback allows an action to fire before the menu is displayed
          // an example usage would be closing a tooltip
          if (openCallback) openCallback(data, index);

          // display context menu
          d3.select('.d3-context-menu')
            .style('left', (d3.event.pageX - 2) + 'px')
            .style('top', (d3.event.pageY - 2) + 'px')
            .style('display', 'block');

          d3.event.preventDefault();
        };
      };


      var d3TooltipBox  = function(show, data, openCallback) {
        if( !show ) {
          return function() {
            // $mdDialog.hide();
            d3.event.preventDefault();
          };
        }
        else {
          $mdDialog.hide();

          return function(data) {
            if (openCallback) openCallback(data);

            $mdDialog.show({
              controller: 'resourcePropertyDialogController',
              templateUrl: './app/modal/resource.property.dialog.html',
              parent: angular.element(document.body),
              //targetEvent: ev,
              clickOutsideToClose:true,
              focusOnOpen: false,
              hasBackdrop: false,
              locals : {
                resourceData: data.data
              }
            })
            .then(function(answer) {
              //$scope.status = 'You said the information was "' + answer + '".';
            }, function() {
              //$scope.status = 'You cancelled the dialog.';
            });

            d3.event.preventDefault();
          }
        }
      };

      var onNodeTouchStart = function() {

        return function(node) {
          var t2 = d3.event.timeStamp,
            t1 = node.lastTouch || t2,
            dt = t2 - t1,
            fingers = d3.event.targetTouches.length;

          node.lastTouch = t2;


          if(fingers > 1) {

            //d3.event.preventDefault();
            d3ContextMenu(menu)();
            return; //  multi touch
          }

          else if (!dt || dt > 500) {
            return;
          }

          else {
            //  doubl touch
            d3.event.preventDefault();
            showResourcePropertyPanel()(node);
          }



        }


      }

      var showResourcePropertyPanel  = function() {

        return function(node) {

          if(node && node.data) {
            var index = $scope.selectedResourceList.indexOf(node);

            var resource = node.data;
            var resType = Object.keys(resource);

            var acpOrigin = resourceMonitor.acpOrigin;
            var resourceUrl = resourceMonitor.monitoringTarget.baseUrl + '/' + resource[resType].ri;

            
            node.popupDeleteAuthority = (node.depth < resourceMonitor.targetResourceDepth) ? false : true;

            var eventOffsetX = 100; // node.x;
            var eventOffsetY = 100; // node.y;
            if(d3.event instanceof TouchEvent) {

              var resourceTreeView = document.getElementById('resource-tree-view');
              var baseX = resourceTreeView.scrollLeft - resourceTreeView.offsetLeft;
              var baseY = resourceTreeView.scrollTop - resourceTreeView.offsetTop;

              eventOffsetX = baseX + d3.event.targetTouches[0].clientX;
              eventOffsetY = baseY + d3.event.targetTouches[0].clientY;
            }
            else if(d3.event instanceof MouseEvent) {
              eventOffsetX = d3.event.offsetX; // node.x;
              eventOffsetY = d3.event.offsetY; // node.y;
            }

            onem2mService.getResource(resourceUrl, acpOrigin)
              .then(function(res){
                node.data = res;

                $scope.$apply(function(){
                  node.clearUpdated();

                  if(index == -1) {
                    node.ppx = eventOffsetX;
                    node.ppy = eventOffsetY;
                  }
                  else {
                    $scope.selectedResourceList.splice(index, 1);
                  }

                  $scope.selectedResourceList.push( node );
                  node.setSelected(true);
                  updateTree(node);
                });
              }, function(){

                $scope.$apply(function(){
                  node.clearUpdated();

                  if(index == -1) {
                    node.ppx = eventOffsetX;
                    node.ppy = eventOffsetY;
                  }
                  else {
                    $scope.selectedResourceList.splice(index, 1);
                  }

                  $scope.selectedResourceList.push( node );
                  node.setSelected(true);
                  updateTree(node);
                });
              })
              .catch(function(ex){

              })
          }
          d3.event.preventDefault();
        };
      };


      var d3TooltipBox2 = function (show, data, openCallback) {

        if( !show ) {

          return function() {
            d3.select('.d3-tooltip-box').style('display', 'none');
            d3.event.preventDefault();
          };

        }
        else {
          // create the div element that will hold the context menu
try {
          var dtb = d3.selectAll('.d3-tooltip-box')
            .data([1])
            .enter()
            .append('div')
            .attr('class', 'd3-tooltip-box')
            .style('display', 'none');

          dtb.append('span');
          dtb.append('img')
            .attr('src', './images/img_tooltip.png');
}
catch( e ) {
  console.log( e );
}
          // this gets executed when a contextmenu event occurs
          return function(data) {  

try {
            // the openCallback allows an action to fire before the menu is displayed
            // an example usage would be closing a tooltip
            if (openCallback) openCallback(data);

            var span = d3.select('.d3-tooltip-box span');
            if( span.text() != data.getName() )
              span.text(data.getName());

            // display context menu
            d3.select('.d3-tooltip-box')
              .style('left', (d3.event.pageX - 16) + 'px')
              .style('top', (d3.event.pageY - 60) + 'px') //  70
              .style('display', 'block');

            d3.event.preventDefault();
}
catch(e) {
  console.log( e );
}            
          };
        }



        
      };

      function getResourceColor(nodeData){
        var typeCode = nodeData.getTypeCode();

        if(typeCode && _.has(NODE_COLORS, typeCode)) {
          return NODE_COLORS[typeCode];
        }

        return "rgb(177, 177, 177)";  // unknown color
      }


      function getResourceIcon(nodeData){
        var baseUrl = "./images/";
        var typeCode = nodeData.getTypeCode();

        if(typeCode && _.has(NODE_ICONS, typeCode)) {
          return baseUrl + NODE_ICONS[typeCode];
        }

        //return baseUrl + "icon_resource_unknown.png";  // unknown color
        return baseUrl + "loading_ani.gif";  // unknown color
      }

      function updateTree(source) {



        // Tab이 백그라운드 작동시 Transition이 넘치는 걸 방지
        if(document.hidden) return;

        var tree = $scope.tree;
        if( !tree || !tree.nodes )
          return;


        if( !source || !source.x0 || !source.y0 || !source.x || !source.y ) {
          if( !source ) {
            source.x0 = 1;
            source.y0 = 1;
          }

          if( !source.x0 ) {
            source.x0 = 1;
          }

          if( !source.y0 ) {
            source.y0 = 1;
          }

          if( !source.x ) {
            source.x = 1;
          }

          if( !source.y ) {
            source.y = 1;
          }
        }







        // compute the new height
        var levelWidth = [1];
        
        var childCount = function(level, n) {
          var maxDepth = 0;

          var children = getNodeChildren(n);

          if(children && children.length > 0) {
            if(levelWidth.length <= level + 1) levelWidth.push(0);

            levelWidth[level+1] += children.length;
            children.forEach(function(d) {
              maxDepth = Math.max(maxDepth, childCount(level + 1, d) );
            });
          }

          return maxDepth + 1;
        };
        
        var maxNodeDepth = childCount(0, root);

        newHeight = d3.max(levelWidth) * 60 + 200; // 20 pixels per line
        newWidth = Math.max(1760, 200+340*maxNodeDepth)


        tree = tree.size([newHeight, newWidth]);

        var scale = $scope.zoom.scale();
        newHeight = newHeight * scale;
        newWidth = newWidth * scale;

        d3.select("#resource-tree-view svg")
            .style("height", (newHeight + 100) + "px")
            .style("width", (newWidth)+"px");

        // Compute the new tree layout.




        
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);
/*
        tree.children(function(d) {
          return getNodeChildren(d);
        });
*/
        tree.sort(function(a,b){
          return a.compare(b);
        });

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * (180+160); });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });


        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
              try {
                if(d.parent) {
                  return "translate(" + (d.parent.y0+180) + "," + (d.parent.x0+12) + ")";
                }
                else {
                  return "translate(" + (source.y0+180) + "," + (source.x0+12) + ")";
                }
              }
              catch(ex) {
                console.log("TRANSLATE ERROR: ", d);
                console.log(ex);
              }
            })
            .on("mousemove", d3TooltipBox2(true))
            .on("mouseout", d3TooltipBox2(false))
            .on("dblclick", showResourcePropertyPanel())
            .on("touchstart", onNodeTouchStart())
            //.on("dblclick", click)
            .on("contextmenu", d3ContextMenu(menu));

        nodeEnter.append("rect")
            .attr("class", "node-rect")
            .attr("height", 8)
            .attr("width", 8)
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 0);

        nodeEnter.append("circle")
            .attr("class", "node-circle")
            .attr("r", 8)
            .attr("cx", 9)
            .attr("cy", 8);

        nodeEnter.append("text")
            .attr("class", "node-text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 1e-6)
            .attr("text-anchor", "start")
            .text(function(d) {
              if(d.getTypeCode() == 4){
                var con = d.data['m2m:cin']['con'];
                switch(typeof con) {
                  case 'object':
                    con = JSON.stringify(con);
                    break;

                  case 'undefined':
                  case 'function':
                    con = '';
                    break;

                  default:
                    con = con.toString();
                    break;
                }
                return con.ellipsis(17);
              }else{
                return d.name.ellipsis(17); 
              }
              });

        nodeEnter.append("image")
            .attr("xlink:href", function(d){return getResourceIcon(d);})
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 1e-6)
            .attr("height", 1e-6);

        var expandMark = nodeEnter.append("g")
            .attr("class", "expand-marker")
            .attr("transform", function(d) { return "translate(0, 0)"; })
            .style("visibility", function(d){return (d.hasChildren() || !d.isDiscovered()) ? "visible" : "hidden";})
            .on("click", click);
        expandMark.append("circle")
            .attr("class", "marker-circle")
            .attr("cx", "8")
            .attr("cy", "8")
            .attr("r", "8");
        expandMark.append("line")
            .attr("class", "vertical")
            .attr("x1", "8")
            .attr("y1", "3")
            .attr("x2", "8")
            .attr("y2", "13");
        expandMark.append("line")
            .attr("class", "horizontal")
            .attr("x1", "3")
            .attr("y1", "8")
            .attr("x2", "13")
            .attr("y2", "8");
        expandMark.append("path")
            .attr("class", "arrow")
            .attr("d", "M7,3 L12,8 L7,13");

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("class", function(d) {
              var className = "node";
              if(d) {
                className += " " + d.getTypeName();
                if( d.selected )
                  className += " selected";
                if( d.updated )
                  className += " updated";
                if( d.justupdated )
                  className += " justupdated";
                if( d.justupdated && $scope.animation )
                  className += " animated"

                return className;
              }
              else {
                return "node";
              }
            })
            .attr("transform", function(d) { 
              return "translate(" + d.y + "," + d.x + ")"; 
            })
            .style("filter", function(d) {
              if( d.getTypeCode(true) ) {
                return "";
              }
              else {
                return "url(#filter-blur)";
              }
            })
            ;// .remove();

        nodeUpdate.select("rect")
            .attr("height", 30)
            .attr("width", 180)
            .attr("rx", 15)
            .attr("x", 10)
            .attr("y", 5)
            .style("stroke", function(d){return getResourceColor(d);});

        nodeUpdate.select("circle")
            .attr("r", 20)
            .attr("cx", 20)
            .attr("cy", 20)
            .style("fill", function(d) {
                var typeCode = d.getTypeCode(true);
                if(typeCode == '5') {   //  CSE Base인 경우만 예외 디자인 적용 
                  return "white";
                }
                else {
                  return getResourceColor(d); 
                }
              }
            )
            .style("stroke", function(d){
                var typeCode = d.getTypeCode();
                if(typeCode == '5') {   //  CSE Base인 경우만 예외 디자인 적용 
                  return getResourceColor(d); 
                }
                else {
                  return "white";
                }
              }
            );

        nodeUpdate.select("text")
            .attr("x", 50)
            .attr("y", 25)
            .style("fill-opacity", 1)
            .style("fill", function(d){ return d.updated ? '#ff0000' : '#000000';});

        nodeUpdate.select("image")
            .attr("xlink:href", function(d){return getResourceIcon(d);})
            .attr("x", "7")
            .attr("y", "7")
            .attr("width", "26")
            .attr("height", "26");

        nodeUpdate.select("g.expand-marker")   
            .style("visibility", function(d){return (d.isDiscovered() && !d.hasChildren()) ? "hidden" : "visible";})
            .attr("transform", "translate(180, 12)");

        nodeUpdate.select("g.expand-marker circle")   
            .style("stroke", function(d){return getResourceColor(d);});

        nodeUpdate.select("g.expand-marker line.horizontal")   
            .style("stroke", function(d){return getResourceColor(d);})
            .style("visibility", function(d){return (d.isDiscovered() && d.hasChildren()) ? "visible" : "hidden";});

        nodeUpdate.select("g.expand-marker line.vertical")
            .style("stroke", function(d){return getResourceColor(d);})
            .style("visibility", function(d){return (d.isDiscovered() && d.hasChildren() && d.isCollapsed()) ? "visible" : "hidden";});

        nodeUpdate.select("g.expand-marker path.arrow")
          .style("stroke", function(d){return getResourceColor(d);})
          .style("visibility", function(d){return (!d.isDiscovered()) ? "visible" : "hidden";});



          // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { 
              if( d.parent )
                return "translate(" + (d.parent.y+180) + "," + (d.parent.x+12) + ")"; 
              else
                return "translate(0, 0)";
            })
            .remove();

        nodeExit.select("rect")
            .attr("height", 1e-6)
            .attr("width", 1e-6)
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 0) 
            .attr("stroke-width", 1e-6)
            .attr("stroke", function(d){return getResourceColor(d);})
            .style("fill", "#fff");

        nodeExit.select("circle")
            .attr("cx", 9)
            .attr("cy", 8)
            .attr("r", 1e-6);


        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        var expandMark = nodeExit.select("g.expand-marker")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(0, 0)")
            .style("visibility", "hidden");



        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {

              //var so = {x: source.x0, y: source.y0};
              var so = {x: d.source.x, y: d.source.y};

              return diagonal({source: so, target: so});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", function(d) {
              var so = {x: d.source.x, y: d.source.y};
              var to = {x: d.target.x, y: d.target.y-180};
              return diagonal({source: so, target: to});
            })
            ;// .remove();
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var so = {x: d.source.x, y: d.source.y};
              return diagonal({source: so, target: so});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      // Toggle children on click.
      function click(d) {

        if( !d.isDiscovered() || d.isCollapsed() ) {
          d.expand();
        }
        else {
          d.collapse(); 
        }

        updateTree(d);

        d3.event.stopPropagation();
      }

    };

    function getMenuBitVector(data){
      var menuBitVector = 0;  // reset to zero
      if(data.depth == 0 || data.depth < resourceMonitor.targetResourceDepth){
        menuBitVector |= (1 << 2);  // 2 mean delete fn
      }
      if(data.depth < resourceMonitor.targetResourceDepth-1){
        menuBitVector |= (1 << 1);  // 1 mean crate fn
      }
      else if(!menuBitVector){  // if typecode is 4, 5, 23 then remove create in menu
        var contentModelLength = window.OneM2M.Resource.getContentModel('m2m:'+ data.getTypeName()).length;
        if(contentModelLength == 0){
          menuBitVector |= (1 << 1);
        }else{
          menuBitVector = 0;
        }
      }

      return menuBitVector;
    }
})();

