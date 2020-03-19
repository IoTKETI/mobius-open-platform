(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('userController', UserController)
  ;


  UserController.$inject = ['$scope', '$state', 'apiService', 'authService', 'notificationService', '$location'];
  function UserController($scope, $state, apiService, authService, notificationService, $location) {

    $scope.signin = {
      userId: "",
      userName: "",
      email: "",
      password: "",
      passwordCheck: ""
    };

    $scope.login = {
      userId: "user3",
      password: "qqq111",
      type: "web"
    };


    $scope.init = _init;

    //  sign in
    $scope.doSignin = _doSignin;
    $scope.checkUserId = _checkUserId;

    //  login
    $scope.doLogin = _doLogin;


    function _init() {
      authService.getLoginUser()
      .then(function(){
        $state.go("dashboard");
      })
      .catch(function(err){
        $location.href=serverUrl+"/#!/login";
        notificationService.showErrorMessage(err, true);
      });
    }

    function _doSignin() {
      //  TODO do validation for input values



      apiService.user.signin($scope.signin)
        .then(function(){
          $state.go('login');
        })

        .catch(function(err){

        });
    };


    function _checkUserId() {
      apiService.user.checkUserId($scope.signin)
        .then(function(result){
          $scope.signin.successValidation = true;
          console.log( result );

        })
        .catch(function(err){
          console.log( err );
        })
    }




    function _doLogin() {
      //  TODO do validation for input values



      apiService.user.login($scope.login)
        .then(function(){
          $state.go('dashboard');
        })

        .catch(function(err){

        });
    };



  }

})();
