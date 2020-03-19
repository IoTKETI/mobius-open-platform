(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('confirmModalController', ConfirmModalController)
  ;


  ConfirmModalController.$inject = ['$scope', 'theme', 'title', 'messages', 'prompt', 'close'];


  function ConfirmModalController($scope, theme, title, messages, prompt, close) {

    $scope.theme = '';
    if(theme) {
      $scope.theme = 'modal-' + theme;
    }
    $scope.title = title;

    if(Array.isArray(messages))
      $scope.messages = messages;
    else
      $scope.messages = [messages];
    $scope.prompt = prompt;

    $scope.confirmModal = _confirmModal;

    function _confirmModal(result) {

      close(result, 200); // close, but give 200ms for bootstrap to animate
    }

  }



})();
