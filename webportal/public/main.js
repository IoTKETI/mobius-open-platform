(function(){
  'use strict';

  angular
    .module('mobiusPortal', ['ui.router', 'pascalprecht.translate', 'ncy-angular-breadcrumb', 'angularModalService', 'ngTagsInput', 'chart.js', 'toastr', 'angularMoment', 'jsonFormatter', 'ngCookies', 'angular-jwt'])
    .config(config)
    .service('alertService', AlertService)
    .run(function($rootScope, amMoment, authService){
      authService.getSysInfo()
        .then(function(info){
          var serviceUrl = info.serviceUrl;
          var s = {};
          s.mobiusState = `http://${serviceUrl.WEBPORTAL}/#!/dashboard`;
          s.deviceManage = `http://${serviceUrl.WEBPORTAL}/#!/device-list`;
          s.accessProtect = `http://${serviceUrl.WEBPORTAL}/#!/acp-list/`;
          s.dataBrowser = `http://${serviceUrl.WEBPORTAL}/#!/data-browser/"`;
          s.resmon = `http://${serviceUrl.RES}`;
          s.ota = `http://${serviceUrl.OTA}`;
          s.sns = `http://${serviceUrl.SNS}`;
          s.dashboard = `http://${serviceUrl.DASHBOARD}`;
          $rootScope.serviceUrl = s;
          $rootScope.serverUrl = `http://${serviceUrl.WEBPORTAL}`;
          $rootScope.domain = serviceUrl.domain;
        })
      amMoment.changeLocale('ko')
    })
  ;

  AlertService.$inject = ['$state', 'toastr'];

  function AlertService($state, toastr) {

    var services = {
      "showErrorMessage": _showErrorMessage,
      "showInfoMessage": _showInfoMessage
    };
    return services;

    function __getMessage(err) {
      var errorMesg = '';

      if(typeof err === 'string') {
        errorMesg = err;
      }
      else {
        if(err.status) {
          errorMesg = ['[', err.status, ']', ' ', err.statusText, '\r\n'].join('');
        }

        if(err.data) {
          errorMesg += err.data + '\r\n';
        }

        if(errorMesg === '')
          errorMesg = err.toString();
      }

      return errorMesg;
    }

    function _showErrorMessage(err, force) {
      var errorMesg = __getMessage(err);

      if(!force && err.status && err.status == 401) {
        $state.go('login');
      }
      else {
        toastr.error(errorMesg, '오류');
      }
    }

    function _showInfoMessage(err) {
      var errorMesg = __getMessage(err);

      toastr.info(errorMesg);
    }
  }

  function config($stateProvider, $urlRouterProvider, $breadcrumbProvider, $httpProvider, $cookiesProvider, toastrConfig ) {


    $breadcrumbProvider.setOptions({
      prefixStateName: 'main',
      includeAbstract: true,
      template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
    });

    angular.extend(toastrConfig, {
      autoDismiss: true,
      positionClass: 'toast-top-center',
      timeOut: 5000,  //  5000
      extendedTimeOut: 1000,  //  1000

      closeButton: false,
      maxOpened: 0,
      newestOnTop: true,
      containerId: 'toast-container',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });


    $urlRouterProvider.otherwise('/home');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
      .state('main', {
        abstract: true,
        templateUrl: 'views/layouts/main.html',
        ncyBreadcrumb: {
          label: 'MOBIUS'
        }
      })


      .state('login', {
        url: '/login',
        templateUrl: '_auth/login.html',
        controller: 'authController'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: '_auth/signup.html',
        controller: 'authController'
      })
      .state('password-reset', {
        url: '/password-reset',
        templateUrl: '_auth/password.reset.html',
        controller: 'authController'
      })
      .state('password-change', {
        url: '/password-change/:token',
        templateUrl: '_auth/password.change.html',
        controller: 'authController'
      })

      .state('home', {
        url : '/home',
        templateUrl : '_home/home.html'
      })

      .state('main.dashboard', {
        url: '/dashboard',
        templateUrl: '_dashboard/dashboard.html',
        controller: 'dashboardController',
        ncyBreadcrumb: {
          label: '대시보드'
        }
      })

      .state('main.device', {
        abstract: true,
        ncyBreadcrumb: {
          label: '디바이스 등록 관리'
        }
      })

      .state('main.device.device-list', {
        url: '/device-list',
        templateUrl: '_devices/device.list.html',
        controller: 'deviceListController',
        ncyBreadcrumb: {
          label: '디바이스 목록'
        }
      })
      .state('main.device.device-register', {
        url: '/device-register',
        templateUrl: '_devices/device.register.html',
        controller: 'deviceRegisterController',
        ncyBreadcrumb: {
          label: '디바이스 등록'
        }
      })
      .state('main.device.device-edit', {
        url: '/device-edit/:deviceId',
        params: {
          deviceId: null
        },
        templateUrl: '_devices/device.edit.html',
        controller: 'deviceEditController',
        ncyBreadcrumb: {
          label: '디바이스 정보'
        }
      })


      .state('main.data-browser', {
        url: '/data-browser/:deviceId?',
        params: {
          deviceId: null
        },
        templateUrl: '_devices/data.browser.html',
        controller: 'dataBrowserController',
        ncyBreadcrumb: {
          label: '데이터 탐색기'
        }
      })


      .state('main.acp', {
        abstract: true,
        ncyBreadcrumb: {
          label: '접근 권한 관리'
        }
      })

      .state('main.acp.acp-list', {
        url: '/acp-list/:acpId?',
        templateUrl: '_acp/acp.list.html',
        controller: 'acpListController',
        ncyBreadcrumb: {
          label: '접근 권한 목록'
        }
      })

     .state('main.ota-manager', {
        url: '/ota-manager/:aeResourceName',
        templateUrl: '_tools/ota.html',
        controller: 'otaController',
        ncyBreadcrumb: {
          label: 'OTA 관리기'
        }
      })



     .state('main.chatbot-manager', {
        url: '/chatbot-manager',
        templateUrl: '_tools/chatbot.html',
        controller: 'chatbotController',
        ncyBreadcrumb: {
          label: '챗봇 관리기'
        }
      })


      .state('error-404', {
        url: '/404',
        templateUrl: 'views/pages/404.html'
      })
      .state('error-500', {
        url: '/500',
        templateUrl: 'views/pages/500.html'
      })

    ;

    // $httpProvider.interceptors.push('tokenInjector');
    // $httpProvider.defaults.withCredentials = true;
    // $cookiesProvider.defaults.domain = "localocean.org:8881:8881";
  }


})();

