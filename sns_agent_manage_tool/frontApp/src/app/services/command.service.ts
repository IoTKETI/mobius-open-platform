import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlStore } from './server.url'
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CommandService {

  private URL : String;
  constructor(private http : HttpClient, private urlStore : UrlStore) { 
    this.URL = this.urlStore.serverURL + '/cmd';
    console.log(this.URL);
  }

  getCommands(botID){
    return this.http.get<any>(`${this.URL}`, { params : { botID : botID}});
  }

  addCommand(botID, command){
    return this.http.post(`${this.URL}`, {
      botID : botID,
      command : command.command,
      target : command.target,
      method : command.method,
      des : command.des
    })
  }

  modifyCommand(botID, command){
    return this.http.put(`${this.URL}`, {
      botID : botID,
      cmdID : command.cmdID,
      command : command.command,
      target : command.target,
      method : command.method,
      des : command.des
    });
  }

  toggleCommandActivity(botID, cmdID){
    return this.http.put(`${this.URL}/toggle`, {
      botID : botID,
      cmdID : cmdID
    })
  }

  deleteCommandActivity(botID, cmdID){
    return this.http.delete(`${this.URL}`, {
      params : {
        botID : botID,
        cmdID : cmdID
      }
    })
  }

  deleteCommands(botID, cmdIDs){
    return this.http.delete(`${this.URL}/list`,{
      params : {
        botID : botID,
        cmdIDs : cmdIDs
      }
    });
  }

  changeActivityMany(botID, cmdIDs, target) : Observable<any>{
    
    return this.http.put(`${this.URL}/activities`, {
      botID : botID,
      cmdIDs : cmdIDs,
      target : target
    })
  }
}
