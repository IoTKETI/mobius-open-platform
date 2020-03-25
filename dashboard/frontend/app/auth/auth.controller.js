(function(){
  'use strict';


  angular
    .module('dashboard')
    .controller('authController', AuthController)
  ;



  AuthController.$inject = ['$scope', '$state', '$stateParams', 'authService', 'notificationService' ];


  function AuthController($scope, $state, $stateParams, authService, notificationService) {

    $scope.formData = {
      "login": {
        "userId": "",
        "password": "",
        "type": "web"
      },

      "signup": {
        "userName": "",
        "userId": "",
        "password": "",
        "password2": ""
      },

      "change": {
        "password": "",
        "password2": ""
      },

      "reset": {
        "userId": ""
      }
    }

    $scope.init = _init;
    $scope.login = _login;
    $scope.signup = _signup;
    $scope.passwordResetRequest = _passwordResetRequest;
    $scope.changePassword = _changePassword;
    $scope.checkPasswordStrength = _checkPasswordStrength;
    $scope.disableSignupButton = _disableSignupButton;
    $scope.disableChangeButton = _disableChangeButton;
    $scope.showUserAgreementModal = _showUserAgreementModal;



    function _init() {

    }

    function _login() {
      var formData = $scope.formData['login'];

      formData.userId = (formData.userId === undefined) ? '' : formData.userId.trim();
      if(!formData.userId) {
        notificationService.showErrorMessage('Invalid userId. retry');
        return;
      }

      if(!formData.password) {
        notificationService.showErrorMessage('Invalid password. retry');
        return;
      }

      authService.login(formData.userId, formData.password, formData.type)
        .then(function(user){
          $state.go('device-all');
        })
        .catch(function(err){
          notificationService.showErrorMessage(err.data);

          $state.go('login');
        });
    } //  end of function _login()


    function _signup() {
      var formData = $scope.formData['signup'];

      formData.userName = (formData.userName === undefined) ? '' : formData.userName.trim();
      if(!formData.userName) {
        notificationService.showErrorMessage('Invalid userName. retry');
        return;
      }

      formData.userId = (formData.userId === undefined) ? '' : formData.userId.trim();
      if(!formData.userId) {
        notificationService.showErrorMessage('Invalid email. retry');
        return;
      }

      if(!formData.password) {
        notificationService.showErrorMessage('Invalid password. retry');
        return;
      }


      if(!formData.password2) {
        notificationService.showErrorMessage('Invalid repeat password . retry');
        return;
      }


      if(formData.password !== formData.password2) {
        notificationService.showErrorMessage('Password miss match. retry');
        return;
      }


      authService.signup(formData.userName, formData.userId, formData.password)
        .then(function(user){

          $state.go('login');
        })
        .catch(function(err){
          notificationService.showErrorMessage(err);
          $state.go('signup');
        });

    } //  end of function _singup()

    function _passwordResetRequest() {
      var formData = $scope.formData['reset'];

      formData.userId = (formData.userId === undefined) ? '' : formData.userId.trim();
      if(!formData.userId) {
        notificationService.showErrorMessage('Invalid email. retry');
        return;
      }

      authService.requestResetPassword(formData.userId)
        .then(function(user){
          $state.go('main.dashboard');
        })
        .catch(function(err){

          $state.go('login');
        });
    }

    function _changePassword() {
      var formData = $scope.formData['change'];

      authService.changePassword($stateParams.token, formData.password, formData.password2)
        .then(function(user){
          $state.go('main.dashboard');
        })
        .catch(function(err){

          $state.go('login');
        });
    }




    function _checkPasswordStrength(formName) {
      var formData = $scope.formData[formName];

      var result = authService.checkPassword(formData.password);
      $scope.validPassword = result[0];
      $scope.passwordValidationMessage = result[1];
    }

    function _disableSignupButton() {

      if(!$scope.validPassword)
        return true;

      var formData = $scope.formData['signup'];
      formData.userName = formData.userName.trim();
      if(!formData.userName) {
        return true;
      }

      formData.userId = formData.userId.trim();
      if(!formData.userId) {
        return true;
      }

      if(!formData.password) {
        return true;
      }

      if(!formData.password2) {
        return true;
      }

      if(formData.password !== formData.password2) {
        return true;
      }

      return false;
    }

    function _disableChangeButton() {

      if(!$scope.validPassword)
        return true;

      var formData = $scope.formData['change'];
      if(!formData.password) {
        return true;
      }

      if(!formData.password2) {
        return true;
      }

      if(formData.password !== formData.password2) {
        return true;
      }

      return false;
    }


    function _showUserAgreementModal(type) {

      // ModalService.showModal({
      //   templateUrl: "_auth/auth.agree.modal.html",
      //   controller: "authAgreeModalController",
      //   inputs: {type: type}
      // }).then(function(modal) {
      //   modal.element.modal();
      //   modal.close.then(function(result) {
      //     if(result) {
      //
      //     }
      //   });
      // });
    }
  }



})();
