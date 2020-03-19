(function(){
  'use strict';

  /*
  'color.picker.core',

   */
  angular
    .module('dashboard', ['ui.router', 'LocalStorageModule', 'ngMaterial', 'hljs', 'ngDraggable', 'mdSteppers', 'SmoothScrollbar', 'gridshore.c3js.chart', 'ngCookies', 'angular-jwt'])
    .config(config)
    .controller('mainController', MainController)
    .run(run);


  function config($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider, localStorageServiceProvider, hljsServiceProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider

      .state('login', {
        url: '/login?os&token',
        views: {
          '': {
            templateUrl: './app/layout/public.layout.html'
          },
          'content@login': {
            templateUrl: './app/user/login.html'
          }
        }
      })

      .state('signin', {
        url: '/signin',
        views: {
          '': {
            templateUrl: './app/layout/public.layout.html'
          },
          'content@signin': {
            templateUrl: './app/user/signin.html'
          }
        }
      })

      .state('password-reset', {
        url: '/password-reset',
        views: {
          '': {
            templateUrl: './app/layout/public.layout.html'
          },
          'content@password-reset': {
            templateUrl: './app/auth/password.reset.html'
          }
        }
      })

      .state('password-change', {
        url: '/password-change',
        views: {
          '': {
            templateUrl: './app/layout/public.layout.html'
          },
          'content@password-change': {
            templateUrl: './app/auth/password.change.html'
          }
        }
      })


      .state('dashboard', {
        url: '/dashboard',
        views: {
          '': {
            templateUrl: './app/layout/personal.layout.html'
          },
          'content@dashboard': {
            templateUrl: './app/dashboard/dashboard.html'
          }
        }
      })



      .state('device-all', {
        url: '/device-all',
        views: {
          '': {
            templateUrl: './app/layout/personal.layout.html'
          },
          'content@device-all': {
            templateUrl: './app/device/device.all.html'
          }
        }
      })


      .state('edit-widget', {
        url: '/edit-widget/:widgetId',
        params: {
          widgetType: 'gauge',
          mode: 'create'
        },
        views: {
          '': {
            templateUrl: './app/layout/personal.layout.html'
          },
          'content@edit-widget': {
            templateUrl: './app/datasource/datasource.html'
          }
        }
      })


      // .state('datasource-list', {
      //   url: '/datasource-list',
      //   views: {
      //     '': {
      //       templateUrl: './app/layout/personal.layout.html'
      //     },
      //     'content@datasource-list': {
      //       templateUrl: './app/datasource/datasource.list.html'
      //     }
      //   }
      // })



      .state('add-datasource', {
        url: '/add-datasource',
        views: {
          '': {
            templateUrl: './app/layout/personal.layout.html'
          },
          'content@add-datasource': {
            templateUrl: './app/datasource/add.datasource.html'
          }
        }
      })

      
      
      ;
      
    // $httpProvider.interceptors.push('tokenInjector')

    localStorageServiceProvider
      .setPrefix('dashboard')
      .setStorageType('localStorage')
      .setNotify(true, true);

    

    $mdThemingProvider.theme('dashboard') 
    .primaryPalette('grey')
    .accentPalette('orange')
    .backgroundPalette('grey');

    hljsServiceProvider.setOptions({
      // replace tab with 4 spaces
      tabReplace: '  ',
      languages: ['javascript']
    });

  };

    //  controller inject
  MainController.$inject = ['$scope', '$state', '$stateParams', '$mdSidenav', '$mdDialog', 'localStorageService', 'apiService', 'notificationService', '$cookies'];


  function MainController($scope, $state, $stateParams, $mdSidenav, $mdDialog, localStorageService, apiService, notificationService, $cookies) {

    $scope.init = _init;

    $scope.openToolbarMenu = _openToolbarMenu;
    $scope.openLoginUserMenu = _openLoginUserMenu;
    $scope.openLanguageMenu = _openLanguageMenu;

    $scope.languageFlagClass = _languageFlagClass;
    $scope.languageFlagName = _languageFlagName;
    $scope.toggleLanguage = _toggleLanguage;

    $scope.gotoSignin = _gotoSignin;
    $scope.gotoLogin = _gotoLogin;

    $scope.logout = _logout;


    function __initSocketChannel(token) {
      if(window.SOCKET) {
        window.SOCKET.close();
      }
      window.SOCKET = io.connect();
      window.SOCKET.on('dashboard.push', function(data){
        notificationService.pushHandler(data);
      });
      window.SOCKET.on('connected', function (data) {

        window.SOCKET.emit('start', {atkn: token});
      });
    }


    function _init() {

      console.log( $stateParams );

      $scope.loginUser = localStorageService.get('loginUser');
      $scope.loginUserName = $scope.loginUser ? $scope.loginUser.userName : '';


      var atkn = $cookies.get('ocean-ac-token');
      __initSocketChannel(atkn);



      $scope.$on("LocalStorageModule.notification.removeitem", function (event, params) {
        if(params.key === 'loginUser') {

          $state.go('intro');
        }

        if(params.key === 'ocean-ac-token') {
          if(window.SOCKET) {
            window.SOCKET.close();
            window.SOCKET = null;
          }
        }
      });

      $scope.$on("LocalStorageModule.notification.setitem", function (event, params) {
        if(params.key === 'loginUser') {
          var loginUser = JSON.parse(params.newvalue);
          $scope.loginUser = loginUser;
          $scope.loginUserName = $scope.loginUser.userName;
        }

        if(params.key === 'ocean-ac-token') {
          __initSocketChannel(params.newvalue);
        }
      });

    }


    function _openLoginUserMenu($mdMenu, ev) {
      $mdMenu.open(ev);
    }


    function _openToolbarMenu($mdMenu, ev) {
      $mdMenu.open(ev);
    }

   function _openLanguageMenu($mdMenu, ev) {
      $mdMenu.open(ev);
    }


    function _gotoSignin() {
      $state.go('signin');
    }

    function _gotoLogin() {
      $state.go('login');
    }

    function _logout() {
      $scope.loginUser = null;
      localStorageService.remove('ocean-ac-token', 'refreshToken', 'loginUser');
      $state.go('login');
    }


    function _toggleLanguage() {
      var languageSetting = 'de';

      if($scope.loginUser) {
        languageSetting = $scope.loginUser.language || 'de';
      }
      else {
        languageSetting = localStorageService.get('language') || 'de';
      }

      languageSetting = (languageSetting === 'de' ? 'us' : 'de');

      if($scope.loginUser) {
        var update = {
          language: languageSetting
        };
        apiService.updateUserProfile(update)
          .then(function(userInfo){
            $scope.$apply(function(){
              $scope.loginUser.language = languageSetting;
            });
          })
      }
      else {
        localStorageService.set('language', languageSetting);
      }
    }

    function _languageFlagClass(toggle) {
      var languageSetting = 'de';

      if($scope.loginUser) {
        languageSetting = $scope.loginUser.language || 'de';
      }
      else {
        languageSetting = localStorageService.get('language') || 'de';
      }

      if(toggle) {
        languageSetting = (languageSetting === 'de' ? 'us' : 'de');
      }

      return 'flag-icon-' + languageSetting;
    }


    function _languageFlagName(toggle) {
      var languageSetting = 'de';

      if($scope.loginUser) {
        languageSetting = $scope.loginUser.language || 'de';
      }
      else {
        languageSetting = localStorageService.get('language') || 'de';
      }

      if(toggle) {
        languageSetting = (languageSetting === 'de' ? 'us' : 'de');
      }

      return languageSetting === 'de' ? "Germany" : "English";
    }
  }


  function run($rootScope, $location) {
    window.API_BASE_URL = "";
    $rootScope.serviceUrl = {
      mobiusState : "http://portal.iotocean.org/#!/dashboard",
      deviceManage : "http://portal.iotocean.org/#!/device-list",
      accessProtect : "http://portal.iotocean.org/#!/acp-list/",
      dataBrowser : "http://portal.iotocean.org/#!/data-browser/",
      resmon : "http://resmon.iotocean.org",
      ota : "http://ota.iotocean.org",
      sns : "http://sns.iotocean.org",
      dashboard : "http://dashboard.iotocean.org"
    }
    $rootScope.serverUrl = "http://portal.iotocean.org";


    if (SVGElement && SVGElement.prototype) {

      SVGElement.prototype.hasClass = function (className) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(this.getAttribute('class'));
      };

      SVGElement.prototype.addClass = function (className) {
        if (!this.hasClass(className)) {
          this.setAttribute('class', this.getAttribute('class') + ' ' + className);
        }
      };

      SVGElement.prototype.removeClass = function (className) {
        var currentClass = this.getAttribute('class');
        if(!currentClass)
          return;

        var removedClass = this.getAttribute('class').replace(new RegExp('(\\s|^)' + className + '(\\s|$)', 'g'), '$2');
        if (this.hasClass(className)) {
          this.setAttribute('class', removedClass);
        }
      };

      SVGElement.prototype.toggleClass = function (className) {
        if (this.hasClass(className)) {
          this.removeClass(className);
        } else {
          this.addClass(className);
        }
      };

    }
  }

})();

