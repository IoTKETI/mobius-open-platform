import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UrlStore } from "../../services/server.url";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private authService : AuthService, 
    private router : Router, 
    private notifier : NotifierService,
    private urlStore : UrlStore) { }

  title = "Login";
  email : String;
  password : String;
  ngOnInit() {
    this.authService.userAuthentiate()
    .subscribe(
      (res : any) => {

        if(res.admin){
          this.router.navigate(['/admin']);
        }else{
          this.router.navigate(['/cmd']);
        }
      },
      err => {
        if(err.status === 401){
          this.authService.getToken()
          .subscribe()
          .unsubscribe();
        } else {
          this.notifier.notify('error', err.error ? err.error.message : '서버와 접속이 되지 않습니다.');
          window.location.href= this.urlStore.portalURL+"/#!/login"
        }
      }
    )

  }
  login() : void {
    /*
    if(!this.email || !this.password){
      this.notifier.notify('warning', "Email 및 비밀번호를 입력해주세요");
    }else{
      this.authService.userAuthentiate()
      .subscribe(
        (res) => {
          localStorage.clear();
          localStorage.setItem('ocean-ac-token', res.headers.get('ocean-ac-token'));
          localStorage.setItem('ocean-re-token', res.headers.get('ocean-re-token'));
          localStorage.setItem('admin', res.body.admin);
          
          if(res.body.admin){
            this.router.navigate(['/admin']);
          }else{
            this.router.navigate(['/cmd']);
          }

        },
        (err) => {
          this.notifier.notify('error', err.error.message);
        }
      )
    }
    */
  }

  register(){
    this.router.navigate(['/join']);
  }

  forgotPw(){
    this.notifier.notify('info', '준비중인 서비스 입니다.');
    // this.router.navigate(['/findpw']);
  }
}
