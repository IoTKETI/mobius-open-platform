(function(){

  angular
    .module('dashboard')
    .controller('MessagesController', [
      MessagesController
    ]);

  function MessagesController( ) {
    var vm = this;

    vm.messages = ['aaa', 'bbb', 'ccc'];


  }

})();
