(function(){
  'use strict';

  angular
  .module('onem2mResourceMonitor')
  .directive('focusMe', function($timeout){
    return {
      restrict: 'A',
      link: function(scope, element) {
        $timeout(function(){
          element[0].focus();
        }, 200);
      }
    };
  });
})();