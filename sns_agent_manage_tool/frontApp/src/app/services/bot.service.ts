import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverURL } from './server.url';
@Injectable({
  providedIn: 'root'
})
export class BotService {

  private URL;

  constructor(private http : HttpClient) { 
    this.URL = serverURL + '/bot';
    console.log(this.URL);
  }

  getBotList(owner) : Observable<any>{
    return this.http.get(`${this.URL}/${owner}/list`);
  }

  addNewBot(owner, bot) : Observable<any>{
    return this.http.post(`${this.URL}/${owner}/add`,{
      name : bot.name,
      token : bot.token,
      tag : bot.tag
    });
  }

  deleteBot(target) : Observable<any>{
    return this.http.delete(`${this.URL}/list`,{
      params : {bot : target}
    })
  }

  getBotInfo(botID) : Observable<any>{
    return this.http.get(`${this.URL}/get`, {params : {botID : botID }});
  }

  getBots(owner) : Observable<any>{
    return this.http.get(this.URL, {params : {owner : owner}});
  }

  getAboutBot(owner) : Observable<any>{
    return this.http.get(`${this.URL}/info`, {params : {owner : owner}});
  }

  removeRequester(botID, valid, request) : Observable<any>{
    return this.http.delete(`${this.URL}/${botID}/list`, {
      params : {
        botID : botID,
        valid : valid,
        request : request
      }
    });
  }

  toUser(botID, target) : Observable<any>{
    return this.http.post(`${this.URL}/user`, {
      target : target,
      botID : botID
    });
  }

  toRequester(botID, target) : Observable<any>{
    return this.http.post(`${this.URL}/request`, {
      target : target,
      botID : botID
    });
  }
}
