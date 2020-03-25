var clientList = [];
var wsIO;
var logger = require('../services/logger');
module.exports = {
    start : (io) => {
        wsIO = io;
        wsIO.on('connection', (socket) => {
            console.log(`[${socket}] connected`);
          
            socket.on('aeid', (ae) => {
          
                console.log(`Client send ae : ${ae}`);
                if(ae instanceof Array){
                    ae.forEach(el => {
                        socket.join(el);
                        // clientList.push({ae : ae, socket : socket.id});
                    })
                }else{
                    socket.join(ae);
                    // clientList.push({ae : ae, socket : socket.id});
                }
            });
          
            socket.on('disconnect', function () {
                console.log(`[WS] : ${socket.id} Disconnected!!`);
            });
          })
    },
    /**
     * @param {String} target target AE's name
     * @param {Array} data data array will be sended to web Client
     */
    sendMessage : (target, data) => {
        try{
            data.push(target);
            
            wsIO.sockets.in(target).emit("status", data);
            // clientID = clientList[aename];
            // if(clientID && wsIO.sockets.sockets[clientID])
            //     wsIO.sockets.sockets[clientID].emit("status", data);
            // else
            //     console.log("Socket for client(" + clientID + ") is not available");

        }catch(err){
            console.error(`websocket disconnected ${target}`);
            logger.error(err);
        }
    },
    close : (aename) => {
        try{
            var sockets = getSocketInRoom(aename);
            sockets.forEach(id => {
                wsIO.sockets.sockets[id].disconnect();
                // wsIO.sockets.sockets[id].leave(aename);
            })
        }catch(err){
            logger.error(err);
        }
    }
}

function getSocketInRoom(roomName){
    try{
        var member = wsIO.sockets.adapter.rooms[roomName].sockets;
        if(member){
            return Object.keys(member);
        }else{
            return null;
        }
    }catch(err){
        return null;
    }
}
