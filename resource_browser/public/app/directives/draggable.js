(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .directive('dragBox', DragBoxDirective)
  ;


  DragBoxDirective.$inject = ['$document'];

  function DragBoxDirective($document) {
    var directive = {
      restrict: 'A',
      link: link,
      scope: {
        data: "="
      }
    }
    return directive;

    function link(scope, element, attrs) {
      var startX = 0,
        startY = 0,
        x = 0,
        y = 20;

      var doc = scope.ownerDocument;

      /**
       * Drag the box.
       */
      var dragAction = function(event) {
        event.preventDefault();

        x = scope.data.ppx;
        y = scope.data.ppy;

        startX = event.pageX - x;
        startY = event.pageY - y;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        $document.on('mouseleave', mouseup);
      };

      angular.element(element[0].querySelector('.draggable-area')).on('mousedown', dragAction);


      function mousemove(event) {

        y = Math.max(event.pageY - startY, 10);
        x = Math.max(event.pageX - startX, 10);

        scope.data.ppx = x;
        scope.data.ppy = y;

        element.css({
          top: y + 'px',
          left: x + 'px'
        });
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        $document.unbind('mouseleave', mouseup);

      }


      /**
       * Remove event-handler and dangling box-drag element from the dom.
       * https://github.com/johnpapa/angular-styleguide#style-y070
       * http://stackoverflow.com/questions/26983696/angularjs-does-destroy-remove-event-listeners
       */
      scope.$on('$destroy', function () {
        angular.element(element[0].querySelector('.draggable-area')).off('mousedown', dragAction);
        element.remove();
      });


    }
  }
})();