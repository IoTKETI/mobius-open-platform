(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor', ['ui.router', 'ui.bootstrap', 'angular-storage', 'angularModalService', 'ngAnimate', 'jsonFormatter', 'ngMaterial', 'ngMessages'])
    .config(config)
    .controller('layoutController', MainLayoutController)
    .run(run);

    function config($stateProvider, $urlRouterProvider, $mdIconProvider, $mdThemingProvider) {

      $mdIconProvider
        .defaultIconSet("./images/svg/avatars.svg", 128)
        .icon("menu", "./images/svg/menu.svg", 24)
        .icon("share", "./images/svg/share.svg", 24)
        .icon("google_plus", "./images/svg/google_plus.svg", 24)
        .icon("hangouts", "./images/svg/hangouts.svg", 24)
        .icon("twitter", "./images/svg/twitter.svg", 24)
        .icon("phone", "./images/svg/phone.svg", 24);


      $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('red');





      $urlRouterProvider.otherwise('/monitor');
      
      $stateProvider
          
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
          url: '/home',
          templateUrl: './views/view-home.html',
          controller: function($scope, $state) {
            $scope.gotoMonitoring = function() {
              $state.go('monitor');
            }
          }
        })
        
        // nested list with custom controller
        .state('home.list', {
            url: '/list',
            templateUrl: './views/view-join.html',
            controller: function($scope) {
                $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
            }
        })
        
        // nested list with just some random string data
        .state('home.paragraph', {
            url: '/paragraph',
            template: 'I could sure use a drink right now.'
        })
        
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('monitor', {
            url: '/monitor/:monitorId',
            params: {
              monitorId: { squash: true, value: null },
            },
            views: {
                '': { templateUrl: './views/view-monitor.html' },
                'controlPanel@monitor': { 
                  templateUrl: './views/view-monitor-control.html',
                  controller: 'controlPanelController' 
                },
                'resourceTree@monitor': { 
                  templateUrl: './views/view-monitor-tree.html',
                  controller: 'resourceTreeController'
                },
                'propertiesPanel@monitor': { 
                  templateUrl: './views/view-monitor-properties.html',
                  controller: 'propertiesPanelController'
                }
            }
        });


    };


    //  controller inject
  MainLayoutController.$inject = ['$rootScope', '$scope', '$stateParams', '$mdSidenav'];


    function MainLayoutController($rootScope, $scope, $stateParams, $mdSidenav) {

      $scope.history = [
        {
          name: 'group1', connecto: [
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']},
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']},
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']}]
        },
        {
          name: 'group2', connecto: [
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']},
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']},
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']}]
        },
        {
          name: 'group3', connecto: [
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']},
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']},
            {host: 'http://203.253.128.161:7575', resources: ['/Mobius/device1', '/Mobius/device2']}]
        }
      ];

      $scope.toggleSidebar = _toggleSidebar;




      function _toggleSidebar() {
        $mdSidenav('legends').toggle();
      }
    }

    function run($rootScope, $location) {

      $rootScope.serviceUrl = {
        mobiusState : "http://portal.iotocean.org/#!/dashboard",
        deviceManage : "http://portal.iotocean.org/#!/device-list",
        accessProtect : "http://portal.iotocean.org/#!/acp-list/",
        dataBrowser : "http://portal.iotocean.org/#!/data-browser/",
        resmon : "http://resmon.iotocean.org",
        dashboard : "http://dashboard.iotocean.org",
        ota : "http://ota.iotocean.org",
        sns : "http://sns.iotocean.org"
      }

      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
        console.log("STATE CHANG START : ", fromState, toState, fromParams, toParams, options);

        if(toParams.monitorId) {
          $rootScope.hideToolbar = true;
        }
      });

      $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl, newState, oldState){
        console.log("LOCATION CHANGE START : " + oldUrl + " -> " + newUrl)
      });

      $.notiny.addTheme('error', {
        notification_class: 'notiny-theme-error notiny-default-vars'
      }); 

      //  check running platform 
      //  check node-webkit
      if( window.process && process.versions && process.versions['node-webkit'])
        window.runningPlatform = "node-webkit";
      else
        window.runningPlatform = "web";


      if( window.runningPlatform == "node-webkit" ) {
        window.API_BASE_URL = "http://localhost:7575";
      }
      else {
        window.API_BASE_URL = ".";
      }
    }

})();

