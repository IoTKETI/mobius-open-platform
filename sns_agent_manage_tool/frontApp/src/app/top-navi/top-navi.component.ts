import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NotifierService } from 'angular-notifier';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UrlStore } from "../services/server.url";

@Component({
  selector: 'app-top-navi',
  templateUrl: './top-navi.component.html',
  styleUrls: ['./top-navi.component.css'],
  encapsulation : ViewEncapsulation.None
})
export class TopNaviComponent implements OnInit {

  url = '';
  public open : boolean = false;
  public account : boolean = false;
  public serviceUrl : any = null;
  public user : any = null;
  constructor(
    private router : Router, 
    private dialog : MatDialog, 
    private authService : AuthService,
    private notifier : NotifierService,
    private ngxService : NgxSpinnerService,
    private urlStore : UrlStore
    ) { 
      router.events.subscribe((route) => {
        if(route instanceof NavigationEnd){
          this.url = router.url;
          if(this.url &&  this.url.length > 0){
            this.url = this.url.slice(1);
          }
        }
      }) 
      authService.getUserInfo()
      .subscribe(rs => {
        if(rs && rs.userInfo){
          this.user = rs.userInfo;
        }
      })
    }

  ngOnInit() {
    this.ngxService.show();
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
  isLogin(){
    return this.authService.isLogin();
  }

  onClickLogout(){
    var user = this.user;
    this.dialog.open(DialogHeaderLogout,{
      width : '250px'
    }).afterClosed().subscribe(
      rs => {
        if(!rs) return;
        this.ngxService.show();
        this.authService.userLogOut(user).subscribe(
          rs => {
            this.ngxService.hide();
            this.authService.clearTokens();
            this.notifier.notify('success','로그아웃 되었습니다.');
            window.location.href= this.urlStore.portalURL+"/#!/login";
          },
          err => {
            this.notifier.notify('error', err.message || "로그아웃 도중 장애가 발생했습니다.");
            this.ngxService.hide();
          }
        )
      },
      err => {
        this.notifier.notify('error', '로그아웃 중 에러가 발생했습니다.')
      }
    )
  }
}

@Component({
  templateUrl : './top-navi.dialog.html'
})
export class DialogHeaderLogout{
  constructor(private dialogRef : MatDialogRef<DialogHeaderLogout>){}
}