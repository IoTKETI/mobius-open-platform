(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .controller('waitforModalController', WaitforModalController);

    WaitforModalController.$inject = ['$scope', 'close'];

    /**
     * [WaitforModalController description]
     * @param {[type]} $scope        [description]
     *
     *
     */
    function WaitforModalController($scope, close) {

      //  scope functions 
      //  
      //////////////////////////////
      $scope.close = closeModal;


      //
      //  implements functions 
      //
      /////////////////////////////////
      function closeModal(result) {

        close(result, 500); //  close, but give 500ms for bootstrap to animate
      }
    };


})();
