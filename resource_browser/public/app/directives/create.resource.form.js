/**
 * [description]
 *
 *
 *
 *  Utilitiy service to help send and listen event between controllers 
 * 
 */
(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .directive('ae', M2mAeDirective)
    .directive('cnt', M2mCntDirective)
    .directive('cin', M2mCinDirective)
    .directive('grp', M2mGrpDirective)
    .directive('sub', M2mSubDirective)
    .directive('sd', M2mSdDirective)
    .directive('ts', M2mTsDirective)
    ;


  function M2mAeDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/ae.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }

    };
  }

  function M2mCntDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/cnt.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }
    };
  }

  function M2mCinDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/cin.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }
    };
  }

  function M2mGrpDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/grp.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }
    };
  }

  function M2mSubDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/sub.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }
    };
  }

  function M2mSdDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/sd.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }
    };
  }

  function M2mTsDirective() {
    return {
      restrict: 'E',
      templateUrl: './app/directives/ts.form.html',
      replace: true,
      scope: {
        resource: '=',
        mode: '@mode'
      }
    };
  }

})();