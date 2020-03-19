var timerService = require('./timerService');
var socketService = require('./webSocketService');
var aeService = require('./aeMgmtService');

const AEModel = require('../models/aeModel');
const logger = require('./logger');

notifyService = {};
/**
 * @function When update PatchState to 'PATHCING'
 * @param {String} aename target AE's name
 */
notifyService.start = function(aename){

  timerService.fnSetTimeout(aename, () => {
      failedProcess(aename, "EndDevice에서 요청이 오지 않습니다.");
    });
}

/**
 * @function When EndDevice request something, update timeout and send data to Web Client
 * @param aename target AE's name
 * @param data for sending web client
 */
notifyService.update = function(aename, ...data){
  timerService.fnSetTimeout(aename, () => {
    failedProcess(aename, "EndDevice에서 요청이 오지 않습니다.");  // work after timeout...
  });
  if(data.length > 0 && data[0] != null){
    socketService.sendMessage(aename, data);
  }
}

notifyService.fail = function(aename, error){
  timerService.fnClearTimeout(aename);  // Cleaer Timeout
  failedProcess(aename, error);
}

notifyService.finish = function(aename){
  timerService.fnClearTimeout(aename);
  aeService.updatePatchState(aename, "SUCCESS")
    .then(aeDoc => {
        socketService.sendMessage(aename, [aeDoc]);
        socketService.close(aename);
    })
    .catch(err => {
        logger(err);
        socketService.close(aename);
    })
}

function failedProcess(aename, error){
  aeService.updatePatchState(aename, 'FAILED')
  .then(rs => {
    socketService.sendMessage(aename, [rs, error]);
    socketService.close(aename);
  })
  .catch(err => {
    logger.error(err);
  })
}
module.exports = notifyService;