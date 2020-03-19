import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { Observable, Observer } from 'rxjs';
import { serverSocket } from './server.url'; 
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  /* for Progress bar */
  // private socket : SocketIOClient.Socket;
  
  constructor() { }

  private socketList = {};
  connect(){

    var socket;
    socket = io(serverSocket);
  
    socket.emit('conn');

    socket.on('disconnect', () =>{
      // console.log(`[webSocketService.ts]\t:\t${aeid} web socket Disconnected!!!`);
      // delete this.socketList[aeid];
    })
    return Observable.create(observer => {
      socket.on('requester', data => {
        observer.next(data);
      })
    })
  }

  disconnect(aename){
    try{
      var socket = this.socketList[aename];
      if(socket){
        socket.disconnect();
        delete this.socketList[aename];
      }
    }catch(err){
      console.error(err);
      throw err;
    }
  }
}
