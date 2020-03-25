(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('authController', AuthController)
  ;



  AuthController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'authService', 'alertService', 'ModalService'];


  function AuthController($scope, $rootScope, $state, $stateParams, authService, alertService, ModalService) {

    $scope.formData = {
      "login": {
        "email": "",
        "password": ""
      },

      "signup": {
        "username": "",
        "email": "",
        "password": "",
        "passwordConfirm": ""
      },

      "change": {
        "password": "",
        "passwordConfirm": ""
      },

      "reset": {
        "email": ""
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

      formData.email = (formData.email === undefined) ? '' : formData.email.trim();
      if(!formData.email) {
        alertService.showErrorMessage('Invalid email. retry');
        return;
      }

      if(!formData.password) {
        alertService.showErrorMessage('Invalid password. retry');
        return;
      }

      authService.login(formData.email, formData.password)
        .then(function(user){
          $state.go('main.dashboard');
        })
        .catch(function(err){
          $state.go('login');
        });
    } //  end of function _login()


    function _signup() {
      var formData = $scope.formData['signup'];

      formData.username = (formData.username === undefined) ? '' : formData.username.trim();
      if(!formData.username) {
        alertService.showErrorMessage('Invalid username. retry');
        return;
      }

      formData.email = (formData.email === undefined) ? '' : formData.email.trim();
      if(!formData.email) {
        alertService.showErrorMessage('Invalid email. retry');
        return;
      }

      if(!formData.password) {
        alertService.showErrorMessage('Invalid password. retry');
        return;
      }


      if(!formData.passwordConfirm) {
        alertService.showErrorMessage('Invalid repeat password . retry');
        return;
      }


      if(formData.password !== formData.passwordConfirm) {
        alertService.showErrorMessage('Password miss match. retry');
        return;
      }


      authService.signup(formData.username, formData.email, formData.password)
        .then(function(user){
          $state.go('login');
        })
        .catch(function(err){
          alertService.showErrorMessage(err);
          $state.go('signup');
        });

    } //  end of function _singup()

    function _passwordResetRequest() {
      var formData = $scope.formData['reset'];

      formData.email = (formData.email === undefined) ? '' : formData.email.trim();
      if(!formData.email) {
        alertService.showErrorMessage('Invalid email. retry');
        return;
      }

      authService.requestResetPassword(formData.email)
        .then(function(user){
          $state.go('main.dashboard');
        })
        .catch(function(err){
          $state.go('login');
        });
    }

    function _changePassword() {
      var formData = $scope.formData['change'];

      authService.changePassword($stateParams.token, formData.password, formData.passwordConfirm)
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
      formData.username = formData.username.trim();
      if(!formData.username) {
        return true;
      }

      formData.email = formData.email.trim();
      if(!formData.email) {
        return true;
      }

      if(!formData.password) {
        return true;
      }

      if(!formData.passwordConfirm) {
        return true;
      }

      if(formData.password !== formData.passwordConfirm) {
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

      if(!formData.passwordConfirm) {
        return true;
      }

      if(formData.password !== formData.passwordConfirm) {
        return true;
      }

      return false;
    }


    function _showUserAgreementModal(type) {
      ModalService.showModal({
        templateUrl: "_auth/auth.agree.modal.html",
        controller: "authAgreeModalController",
        inputs: {type: type}
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result) {

          }
        });
      });
    }
  }



})();
