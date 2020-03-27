import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlStore } from './server.url';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private URL = null;
  private regHttp : HttpClient;
  constructor(
    private http : HttpClient, handler : HttpBackend, private urlStore : UrlStore) { 
      this.regHttp = new HttpClient(handler);
      this.URL = `${urlStore.serverURL}/user`;
    }

  userSignUpRequest(user){
    return this.regHttp.post(this.URL, user);
  }

  userCheckEmail(email){
    return this.regHttp.get(`${this.URL}/check`, {params : {
      email : email
    }})
  }

  userCheckValidBot(token) : Observable<any>{
    return this.regHttp.get(`${this.URL}/token`, {
      params : {
        token : token
      }
    })
  }

  getUserList() : Observable<any>{
    return this.regHttp.get(`${this.URL}`);
  }

  userDeleteRequset(target) : Observable<any>{
    return this.regHttp.delete(`${this.URL}/del`, {
      params : {
        target
      }
    })
  }
}
