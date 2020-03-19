import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpHeaders, HttpResponse } from '@angular/common/http'
import { Observable, of, throwError, from } from 'rxjs';
import { apiConfig, domain } from './serverURL';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, catchError, flatMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class AuthService{

  private url : string;
  private http : HttpClient;
  
  constructor(handler : HttpBackend, private cookie : CookieService) {
    this.http = new HttpClient(handler);
    this.url = apiConfig.toString() + "/auth";
  }

  userAuthentiate(){
    return this.getToken().pipe(
      flatMap((token : string) => {
        return this.http.post(this.url,{}, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
           .append('ocean-ac-token', token), 
          observe: 'response'      
        });
    }))
  }

  userLogOut(user : any) : Observable<any>{
    if(!user){
      throw new Error("사용자 정보가 존재하지 않습니다.");
    }
    return this.http.delete(this.url, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      params : {
        email : user.u_e
      },
      observe: 'response'      
    })
  }

  isLogin(){
    let token = this.cookie.get('ocean-ac-token');
    if(token){
      const isExpired = new JwtHelperService().isTokenExpired(token);
      
      if(!isExpired){
        return true;
      }
    }
    return false;
  }
  
  getToken(){

    let token = this.cookie.get('ocean-ac-token');
    if(token){
      const isExpired = new JwtHelperService().isTokenExpired(token);
      if(!isExpired){
        return new Observable(obs => obs.next(token));
      }
    } else {
      return this.getNewAcessToken();
    }

  }

  getRefreshToken(){
    return this.cookie.get('ocean-re-token');
  }

  public getNewAcessToken(){
    var reToken = this.getRefreshToken();
    if(reToken){
      return this.http.post(`${this.url}/re`, null, { headers : {'ocean-re-token' : reToken}, observe : "response"})
      .pipe(
        // share(),
        map((res) => {
          let token = this.cookie.get('ocean-ac-token');
          if(token){

            return token;
          } else {
            throw new Error("Invalid Token");
          }
        }),
        catchError(err => {
          return throwError(err);
        })
      );
    } else {
      return throwError(new Error("Could not find RefreshToken"));
    }
  }
  
  getUserInfo(){
    return this.getToken().pipe(
      map((newToken:string) =>{
        const decoded = new JwtHelperService().decodeToken(newToken);
        return decoded;
      })
      ,catchError(err => {
        return throwError(err);
      })
    )
  }

  clearTokens(){
    this.cookie.delete('ocean-ac-token', null, domain);
    this.cookie.delete('ocean-re-token', null, domain);
  }

}
