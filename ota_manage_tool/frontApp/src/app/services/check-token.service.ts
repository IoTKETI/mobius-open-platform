import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { NotifierService } from 'angular-notifier';
import { Observable, throwError } from 'rxjs';
import { map, catchError,  } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class CheckTokenService implements CanActivate{

  constructor(private authService : AuthService, private notifier : NotifierService, private router : Router, private cookie : CookieService) { }

  canActivate(next : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean> | Promise<boolean> | boolean { 
    const token = this.cookie.get('ocean-ac-token');
    if(!token){ return true } // 토큰이 없다(첫 로그인, 로그아웃) 로그인을 진행
    return this.authService.getUserInfo().pipe(
      map((rs : any) => {
        if(rs.userInfo && rs.userInfo.u_a){
          this.router.navigate(['/admin']);
          return false;
        }else{
          this.router.navigate(['/ae']);
          return false;
        }
      }),
      catchError(err => {
       this.notifier.notify('error', err.error.message || '서버와 연결이 되지 않습니다.');
        // refresh 만료시 login으로 복귀 못하는 에러 수정
        return Observable.of(true);
      })
    )

  }
}
