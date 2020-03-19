(function(){
  'use strict';


  angular
    .module('mobiusPortal')
    .controller('acpListController', AcpListController)
  ;



  AcpListController.$inject = ['$scope', '$state', '$stateParams', 'acpService', 'ModalService', 'alertService'];


  function AcpListController($scope, $state, $stateParams, acpService, ModalService, alertService) {

    $scope.acpList = [];
    $scope.acpFilter = '';
    $scope.acpId = $stateParams.acpId;

    $scope.init = _init;
    $scope.popupCreateAcpModal = _popupCreateAcpModal;
    $scope.acpListFilter = _acpListFilter;
    $scope.addAcrule = _addAcrule;
    $scope.deleteAcrule = _deleteAcrule;
    $scope.toogleExpandItem = _toogleExpandItem;
    $scope.onAcopValueChanged = _onAcopValueChanged;

    function _init() {

      $scope.userNameTable = {};

      acpService.list()

      .then(function(acpList) {
        $scope.$apply(function () {

          acpList.map(function (acp) {
            if (acp.lbl == undefined) {
              acp.lbl = [];
            }
          });

          $scope.acpList = acpList;

          if ($scope.acpId) {
            $scope.acpList.map(function (acp) {
              if (acp.ri == $scope.acpId)
                acp.expanded = true;
            });
          }
        });

        var usersEmail = [];
        acpList.map(function(acp){
          acp.pv.acr.map(function(acr){
            acr.acor.map(function(acor){
              if(usersEmail.indexOf(acor) == -1)
                usersEmail.push( acor );
            });
          });
        });

        return acpService.getUsersName(usersEmail);
      })

      .then(function(userNames){

        $scope.$apply(function(){
          userNames.map(function(userName){
            $scope.userNameTable[userName.email] = userName.username;
          });
        });
      }, function(err){
        alertService.showErrorMessage(err);
      });

    }

    function _popupCreateAcpModal() {
      // Just provide a template url, a controller and call 'showModal'.
      ModalService.showModal({
        templateUrl: "_acp/acp.create.modal.html",
        controller: "createAcpModalController"
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result) {

            acpService.createAcp(result)
              .then(function(acpObj){
                $scope.$apply(function(){
                  $scope.acpList.push(acpObj['m2m:acp']);
                });
              }, function(err){
                alertService.showErrorMessage(err);
              });
          }
        });
      });
    }


    function _toogleExpandItem(event, acp) {
      acp.expanded = !acp.expanded;

      event.preventDefault();
      event.stopPropagation();
    }


    function _onAcopValueChanged(acp, acr, acop) {

      var index = acp.pv.acr.indexOf(acr);
      if( index == -1 ) {
        alertService.showErrorMessage('Index out of bound error');
      }
      acpService.updateAcrule(acp, index, acop)
        .then(function(acpObj){
          $scope.$apply(function(){
            acp.pv.acr = acpObj['m2m:acp'].pv.acr;
          });
        }, function(err){
          alertService.showErrorMessage(err);
        });
    }


    function _addAcrule(acp) {
      // Just provide a template url, a controller and call 'showModal'.
      ModalService.showModal({
        templateUrl: "_acp/acp.addacrule.modal.html",
        controller: "acpAddacruleModalController"
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result) {
            acpService.addAcrule(acp, result)
              .then(function(acpObj){
                $scope.$apply(function(){
                  acp.pv.acr = acpObj['m2m:acp'].pv.acr;
                });

                var usersEmail = [];
                acp.pv.acr.map(function(acr){
                  acr.acor.map(function(acor){
                    if(usersEmail.indexOf(acor) == -1)
                      usersEmail.push( acor );
                  });
                });

                return acpService.getUsersName(usersEmail);
              })

              .then(function(userNames){
                $scope.$apply(function(){
                  userNames.map(function(userName){
                    $scope.userNameTable[userName.email] = userName.username;
                  });
                });
              }, function(err){
                alertService.showErrorMessage(err);
              });
          }
        });
      });
    }

    function _deleteAcrule(acp, index) {

      acpService.deleteAcrule(acp, index)
        .then(function(acpObj){
          $scope.$apply(function(){
            acp.pv.acr = acpObj['m2m:acp'].pv.acr;
          });
        }, function(err){
          alertService.showErrorMessage(err);
        });

    } //  end of function _deleteAcrule()

    function _acpListFilter(item) {
      if($scope.acpFilter.trim() == '')
        return true;

      var keyword = $scope.acpFilter.toLowerCase();
      var rn = item.rn.toLowerCase();

      if(rn.indexOf(keyword) != -1)
        return true;

      var found = false;
      if(item.lbl) {
        item.lbl.map(function(lbl){
          var lowLbl = lbl.toLowerCase();

          if(lowLbl.indexOf(keyword) != -1)
            found = true;
        });

        if(found)
          return true;
      }

      if(item.pv && item.pv.acr) {
        item.pv.acr.map(function(acr){

          if(acr.acor) {
            acr.acor.map(function(acor){
              var lowAcor = acor.toLowerCase();

              if(lowAcor.indexOf(keyword) != -1)
                found = true;
            });
          }
        });

        if(found)
          return true;
      }

      return false;
    }

  }



})();
