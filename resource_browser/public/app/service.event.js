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
    .service('eventService', EventService);

  EventService.$inject = ['ModalService'];

  function EventService(ModalService) {


    var services = {
      on: on,
      off: off, 
      emit: emit,
      broadcast: broadcast,
      showNoti: showNoti,
      showError: showError,
      showWaitforDialog: showWaitforDialog,
      hideWaitforDialog: hideWaitforDialog
    };
    return services;

    function on(scope, mesg, handler) {
      scope.$on(mesg, handler);
    }

    function off(scope, mesg, handler) {
      scope.$off(mesg, handler);
    }

    function emit(scope, mesg, args) {
      scope.$emit(mesg, args);
    }
    
    function broadcast(scope, mesg, args) {
      scope.$broadcast(mesg, args);
    }

    function showNoti(text) {
      var notinyOptions = {
        position: 'right-top',
        theme: 'light',
        animation_show: 'noti-show-animation 0.5s forwards',
        animation_hide: 'noti-hide-animation 0.5s forwards'
      }

      notinyOptions.text = text;

      $.notiny(notinyOptions); 
    }

    function showError(text) {
      var notinyOptions = {
        position: 'right-top',
        theme: 'error',
        autohide: true,
        clickhide: true,
        animation_show: 'noti-show-animation 0.5s forwards',
        animation_hide: 'noti-hide-animation 0.5s forwards'
      }


      if(text.status) {
        notinyOptions.text = '[' + text.status + '] ' + text.statusText;
      }
      else if(text.statusCode) {
        notinyOptions.text = '[' + text.statusCode + '] ' + text.message;
      }
      else {
        notinyOptions.text = text;
      }

      $.notiny(notinyOptions); 
    }

    function showWaitforDialog() {
      $('#common-waitfor-modal').modal({backdrop: "static"});

/*
      ModalService.showModal({
        templateUrl: '/app/modal/common.waitfor.html',
        controller: 'waitforModalController',
      })
      .then(function(modal){
        modal.element.modal();
        modal.close.then(function(result){
        });
      });
*/
    }

    function hideWaitforDialog() {
      $('#common-waitfor-modal').modal('hide');
    }    
  }

})();