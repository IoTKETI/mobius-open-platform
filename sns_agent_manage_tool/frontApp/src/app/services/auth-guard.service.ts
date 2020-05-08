import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NotifierService } from 'angular-notifier';
import { map, catchError } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { UrlStore } from "../services/server.url";
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements  CanActivate{

  constructor(private authService : AuthService, private notifier : NotifierService, private router : Router, private urlStore : UrlStore) {}

  canActivate(next : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean> | Promise<boolean> | boolean { 
    const token = this.authService.getToken();
    if(!token){ this.redirectToLogin(); return false; } // 토큰이 없으니 로그인으로 안내한다.
    return this.authService.getToken().pipe(
      map((rs : any) => {
        return true;
      }),
      catchError(err => {
        this.redirectToLogin();
        return Observable.of(false);
      })
    );
  }

  redirectToLogin(){
    this.notifier.notify('error', '로그인이 필요합니다. 로그인을 해주세요.')
    window.location.href=this.urlStore.portalURL+"/#!/login";
  }
}
