import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { UserVO } from '../vo/user';
import { UrlStore } from './serverURL';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UserMgmtService {

  private url : string;
  private firmware : string;
  private backHttp : HttpClient;
  constructor(private http : HttpClient, handler : HttpBackend, private urlStore : UrlStore) { 
    this.url = this.urlStore.apiConfig +"/user";
    this.firmware = this.urlStore.apiConfig + "/fw";
    this.backHttp = new HttpClient(handler);
  }

  userSignUpRequest(user : UserVO){
    return this.backHttp.post(this.url, user);
  }

  userModifyInfomation(user : UserVO){
    return this.http.put(this.url, user);
  }

  userDeleteRequset(email : any){
    return this.http.delete(`${this.url}/del`, {params : {email : email}});
  }

  getUserList(){
    return this.http.get<any>(`${this.url}/list`);
  }

  userCheckEmail(email){
    return this.backHttp.get(`${this.url}/check`, {params : {email : email}});
  }

  getPacketSize(){
    return this.http.get<any>(`./fw/block-size`);
  }

  setPacketSize(packetSize){
    return this.http.put<any>(`./fw/block-size`, {size : packetSize});
  }
}
