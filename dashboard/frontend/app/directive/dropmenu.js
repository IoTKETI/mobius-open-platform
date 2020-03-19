(function(){
  angular
    .module('dashboard')
    .directive('dropdown', function($document) {
    return {
      restrict: "C",
      link: function(scope, elem, attr) {
        
        elem.bind('click', function() {
          elem.toggleClass('open');
          elem.addClass('active-recent');
        });
        
        $document.bind('click', function() {
          if(!elem.hasClass('active-recent')) {
            elem.removeClass('open');
          }
          elem.removeClass('active-recent');
        });
        
      }
    }
  });
})();