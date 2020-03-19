/**
 * Created by kimtaehyun on 2017. 7. 20..
 */

var TaskQueue = require ('../libs/task.queue.js');
var SocketIO = require ('socket.io');
const jwt   = require('jsonwebtoken');


var _ = require('lodash');



//  expose Onem2mLogger
exports = module.exports = PushMessageManager;

function PushMessageManager(expressServer) {


  this.io = SocketIO(expressServer);

  //  UI Update하고자 하는 message를 처리하기 위한 message queue
  this.sendMessageQueue = new TaskQueue();


  this.start = _start;
  this.sendPushMessage = _sendPushMessage;

  function _uiMessageHandler(userId, uiMessage) {

    var socket = this.io.sockets.in(userId);
    if(socket)
      socket.emit('dashboard.push', uiMessage);
  }


  function _start() {
    //  sendMessageQueue에 저장된 데이터 handler 추가
    this.sendMessageQueue.addDataHandler(_uiMessageHandler.bind(this));
    //  sendMessageQueue start
    this.sendMessageQueue.start();

    var that = this;
    this.io.on('connection', function (socket) {
      socket.emit('connected', {});


      socket.on('start', function (data) {
        var secret = global.CONFIG.security.authSecret;
        debug.log('WEBSOCKET start');
        jwt.verify(data.atkn, secret, (err, authToken) => {
          if (err) {
            socket.emit('dashboard.push', 'error: cannot connect socket: invalid access token');
          }
          else {
            socket.join(authToken.u_e);
            debug.log('WEBSOCKET start : ' + authToken.u_e);

          }
        });
      });


      socket.on('stop', function (data) {

        socket.leave(data.userId);
      });


    })
  }


  function _sendPushMessage(userId, messageType, messageData) {
    var data = {
      type: messageType,
      data: messageData
    };

    this.sendMessageQueue.enqueue(userId, data);
  }

}


