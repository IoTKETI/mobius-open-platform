import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { NgxSpinnerService } from  'ngx-spinner'
import { UrlStore } from "../../services/serverURL";
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation : ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {

  public open : boolean = false;
  public account : boolean = false;
  public user : any = null;
  public serviceUrl : any = null;
  constructor(
    private router : Router, 
    private dialogRef : MatDialog, 
    private authService : AuthService,
    private notifier : NotifierService,
    private spinner : NgxSpinnerService,
    private urlStore : UrlStore
    ) { 
      this.serviceUrl = this.urlStore.serviceUrl;
      authService.getUserInfo()
      .subscribe(rs => {
        if(rs){
          this.user = rs
        }
      })
      /*
      .pipe(
        map((rs : any) => {
          if(rs.userInfo.u_a){
            this.user = rs.userInfo;
          }else{
            this.notifier.notify('warning', '관리자 권한을 가지지 않았습니다.');
            window.location.href=this.urlStore.portalURL+"/#!/login";
            return false;
          }
        }),
        catchError(err => {
          return throwError(err);
        })
      )*/
    }

  ngOnInit() {
    this.spinner.show();
  }
  openMap(){
    this.open = true;
  }
  closeMap(){
    this.open = false
  }
  
  openAccount(){
    this.account = true;
  }
  closeAccount(){
    this.account = false
  }
  checkLogin(){
    return this.authService.isLogin();
  }

  onClickLogout(){
    var user = this.user;
    this.dialogRef.open(DialogHeaderLogout,{
      width : '250px'
    }).afterClosed().subscribe(
      res => {
        if(!res) return;
        this.authService.userLogOut(user)
        .subscribe(
          res => {
            this.authService.clearTokens();
            this.notifier.notify('success', "로그아웃 처리 되었습니다.");
            window.location.href=this.urlStore.portalURL+"/#!/login";
          },
          err => {
            this.notifier.notify('error', err.error.message);
          }
        )
      },
      err => {
        this.notifier.notify('error', err.message);
      }
    )
  }
}
@Component({
  templateUrl : './header.dialog-logout.html'
})
export class DialogHeaderLogout{
  constructor(private dialogRef : MatDialogRef<DialogHeaderLogout>){}
}
