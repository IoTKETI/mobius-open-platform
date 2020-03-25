'use strict';

angular.module('dashboard')
  .directive('panelWidget', function() {
    return {
      restrict: 'E',
      replace: false,
      transclude: true,
      scope: { widget: '=', template: '@' },
      template: '<div flex layout="column" ng-include="template"></div>',
      compile: function(element, attrs, linker) {
        return function(scope, element) {
          linker(scope, function(clone) {
            element.append(clone);
          });
        };
      }
    };
  });
