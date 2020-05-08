import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotifierService } from 'angular-notifier';
import { map, catchError } from 'rxjs/operators';
import { UrlStore } from "../services/server.url";
@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate{

  constructor(private authService : AuthService, private notifier : NotifierService, private router : Router, private urlStore : UrlStore) { }

  canActivate(next : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean> | Promise<boolean> | boolean { 
    if(this.authService.isLogin()){

      return this.authService.getUserInfo().pipe(
        map((rs : any) => {
          if(rs.userInfo.u_a){
            return true;
          }else{
            this.notifier.notify('warning', '관리자 권한을 가지지 않았습니다.');
            //window.location.href=UrlStore.portalURL+"/#!/login";
            return false;
          }
        }),
        catchError(err => {
          console.error(err);
          return throwError(err);
        })
      )
    }else{
      this.notifier.notify('warning', '로그인 중이 아닙니다. 로그인을 해주세요');
      window.location.href= this.urlStore.portalURL+"/#!/login";
      return false;
    }
  }
}
