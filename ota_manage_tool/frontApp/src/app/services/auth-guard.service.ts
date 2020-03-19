import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NotifierService } from 'angular-notifier';
import * as myGlobal from "../services/serverURL";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements  CanActivate{

  constructor(private authService : AuthService, private notifier : NotifierService, private router : Router) {}

  canActivate(next : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean> | Promise<boolean> | boolean { 
    if(this.authService.isLogin()){
      return true;
    }else{
      // this.notifier.notify('warning', '잘못된 접근입니다. 로그인을 해주세요');
      window.location.href=myGlobal.portalURL+"/#!/login";
      return false;
    }
  }
}
