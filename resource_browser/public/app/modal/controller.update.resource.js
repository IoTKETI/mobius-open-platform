(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('updateResourceModalController', UpdateResourceModalController);

    UpdateResourceModalController.$inject = ['$scope', 'resourceData', 'close'];

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
    function UpdateResourceModalController($scope, resourceData, close) {


      var resourceObj = resourceData.data;
      var resourceType = _.keys(resourceObj)[0];

      $scope.mode = 'update';

      $scope.parentResource = resourceData;
      $scope.resource = {rn:'', lbl:''};

      //  scope functions 
      //  
      //////////////////////////////
      $scope.close = closeModal;
      $scope.contentModel = [];


      var contentModels = window.OneM2M.Resource.getContentModel(resourceType);
      for( var i=0; i < contentModels.length; i++ ) {
        $scope.contentModel.push( {typeCode: contentModels[i], iconUrl: RESOURCE_IMAGES[contentModels[i]]} );
      }

      $scope.model = {};
      $scope.model.selectedResourceType = $scope.contentModel[0].typeCode;

      //
      //  implements functions 
      //
      /////////////////////////////////
      function closeModal(result) {
        close(result, 500); //  close, but give 500ms for bootstrap to animate
      }
    };


})();
