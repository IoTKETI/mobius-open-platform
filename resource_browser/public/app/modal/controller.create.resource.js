(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('createResourceModalController', CreateResourceModalController);

    CreateResourceModalController.$inject = ['$scope', 'store', 'parentNode', 'close'];

    var RESOURCE_IMAGES = {
      "1": "./images/legend_unknown.png",  //  acp - sub
      "2": "./images/legend_ae.png",  //  ae - sub, container, group, acp, pollingChannel, schedule, semanticDesc, timeSeries
      "3": "./images/legend_cnt.png",  // cnt - contentInstance, sub, contain, latest, oldest, semanticDesc,
      "4": "./images/legend_cin.png",  // cin  - semanticDesc
      "5": "./images/legend_cb.png",  //  cb  - ae, container, group, acp, sub, timeseries
      "9": "./images/legend_grp.png",  //  grp  0 sub, semanticDesc
      "10": "./images/legend_unknown.png", //  lcp
      "16": "./images/legend_csr.png", //  csr   -- container, group, acp, subscription, timeseries
      "23": "./images/legend_sub.png", //  sub
      "24": "./images/legend_sd.png", //  sd  - sub
      "25": "./images/legend_ts.png", //  ts   - timeSeriesInstance, sub, semanticDesc
      "26": "./images/legend_tsi.png", //  tsi
      "27": "./images/legend_unknown.png", //  mms
      "99": "./images/legend_unknown.png"  //  rsp
    };

    /**
     * [PropertiesPanelController description]
     * @param {[type]} $scope        [description]
     * @param {[type]} resmonService [description]
     *
     *
     * View 생성 및 UI control event 처리 
     *   onem2m server와의 통신은 onem2mService에 deligate
     *   resource monitor server와의 통신은 resmonService에 deligate 
     */
    function CreateResourceModalController($scope, store, parentNode, close) {

      var parentResourceType = _.keys(parentNode.data)[0];

      //  set scope variables 
      $scope.parentNode = parentNode;
      $scope.mode = 'create';
      $scope.contentModel = [];
      $scope.model = {};
      $scope.resource = {
/*
        rn: 'rn',
        lbl: 'lbl',
        mni: 'mni',
        cbs: 'cbs'
*/
      };

      //  set scope functions 
      $scope.close = closeModal;
      $scope.onResoureceTypeChanged = onResoureceTypeChanged;



      //  initialize scope variables;
      var contentModels = window.OneM2M.Resource.getContentModel(parentResourceType);
      for( var i=0; i < contentModels.length; i++ ) {
        $scope.contentModel.push( {typeCode: contentModels[i], iconUrl: RESOURCE_IMAGES[contentModels[i]]} );
      }
      $scope.model.selectedResourceType = $scope.contentModel[0].typeCode;


      function onResoureceTypeChanged(type) {
        if( type == '3' ) {

        }


        if( type == '4' ) {

        }

        if( type == '23' ) {
          if( typeof $scope.resource.enc1 == 'undefined' ) {
            $scope.resource.enc1 = true;
          }

          if( typeof $scope.resource.nuType == 'undefined' ) {
            $scope.resource.nuType = 'json';
          }

          if( typeof $scope.resource.nu == 'undefined' ) {
            var mqttBrokerIp = store.get('mqttBrokerIp')
            $scope.resource.nu = 'mqtt://' + mqttBrokerIp + '/';
          }
        }
      }

      //  implements of scope functions 
      function closeModal(result) {

        if(result == false)
          return close(null, 500); //  close, but give 500ms for bootstrap to animate

        var aryLbl = [];
        if( $scope.resource.lbl )
          aryLbl = $scope.resource.lbl.split(' ');

        var newResource = null;
        switch( $scope.model.selectedResourceType ) {
          case  '3':
            newResource = {
              'm2m:cnt': {
                rn: $scope.resource.rn,
                lbl: aryLbl,
                mni: $scope.resource.mni//,
                //cbs: $scope.resource.cbs
              }
            };          
            break;

          case  '4':
            newResource = {
              'm2m:cin': {
                con: $scope.resource.con,
                lbl: aryLbl
              }
            };          
            break;

          case  '23':
            var net = [];
            if( $scope.resource.enc1 )
              net.push("1");
            if( $scope.resource.enc2 )
              net.push("2");
            if( $scope.resource.enc3 )
              net.push("3");
            if( $scope.resource.enc4 )
              net.push("4");

            newResource = {
              'm2m:sub': {
                'rn': $scope.resource.rn,
                'enc': {
                  'net': net
                },
                'nu': [$scope.resource.nu + "?ct=" + $scope.resource.nuType],
                'nct': '1'
              }
            };          
            break;

          case  '24': //  smd

            var resourcePath = store.get('resourcePath');
            var cseName = resourcePath.split('/')[1];

            //  Mobius 2.0과 이전 버전을 구분하여 short name을 변경 
            if( cseName == 'Mobius' ) {
              newResource = {
                'm2m:smd': {
                  rn: $scope.resource.rn,
                  lbl: aryLbl,
                  dcrp: $scope.resource.dcrp
                }
              };
            }
            else {
              newResource = {
                'm2m:sd': {
                  rn: $scope.resource.rn,
                  lbl: aryLbl,
                  dspt: $scope.resource.dcrp
                }
              };
            }


            break;


        }

        var result = {
          parent: $scope.parentNode,
          resource: newResource 
        };
        close(result, 500); //  close, but give 500ms for bootstrap to animate
      }

      function createResourceObject() {

      }
    };


})();
