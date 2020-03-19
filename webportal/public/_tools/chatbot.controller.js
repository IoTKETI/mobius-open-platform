(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('chatbotController', ChatbotController)
  ;



  ChatbotController.$inject = ['$scope', '$state', '$stateParams', 'alertService'];


  function ChatbotController($scope, $state, $stateParams, alertService) {

    $scope.init = _init;

    function _init() {




    } //  end of function _init()

  }



})();
