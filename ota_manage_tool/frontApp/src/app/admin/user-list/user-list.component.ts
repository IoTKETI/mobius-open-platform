import { Component, OnInit, Inject } from '@angular/core';
import { UserMgmtService } from 'src/app/services/user-mgmt.service';
import { SelectionModel } from '@angular/cdk/collections';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as myGlobal from "../../services/serverURL";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  public adminNum = 0;
  public selection = new SelectionModel<Element>(true, []);

  public displayedColumn = ['checked', 'email', 'name', 'lastAccess', 'control'];

  public userList : Array<Element>;
  constructor(
    private userMgmtSevice : UserMgmtService, 
    private notifier : NotifierService,
    private dialog : MatDialog,
    private packetDialog : MatDialog,
    router : Router, 
    ) { 
    this.userList = new Array<Element>();
    //토큰에서 admin정보를 확인
    let admin = localStorage.getItem('admin');
    if(admin !== 'true'){
      this.notifier.notify('error', '올바른 경로로 접근하지 않았습니다.');
      window.location.href=myGlobal.portalURL+"/#!/login";
    }
  }

  ngOnInit() {
    this.userMgmtSevice.getUserList().subscribe(
      res =>{
        let cpUserList = new Array<Element>();
        (res as any).forEach(user => {
          cpUserList.push({
            email : user.email,
            name : user.name,
            lastAccess : user.lastAccess,
            admin : user.admin
          } as Element)
          this.adminNum = user.admin ? ++this.adminNum : this.adminNum;
        });
        this.userList = cpUserList;
      },
      (err) => {
        return throwError(err);
      })      
  }

  
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userList.length;
    return numSelected === (numRows - this.adminNum);
  }

  removeSelectedRows() {
     this.selection.selected.forEach(item => {
      let index: number = this.userList.findIndex(d => d === item);
      console.log(this.userList.findIndex(d => d === item));
      this.userList.splice(index,1);

    });
    this.selection = new SelectionModel<Element>(true, []);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.userList.forEach(row => { if(!row.admin){this.selection.select(row)} });
  }

  clickRemove(row?, i?){

    let content;

    if(row){
      content = `${row.email} 유저를 삭제하시겠습니까?`
    } else {
      content = `${this.selection.selected.length}명의 사용자를 삭제하시겠습니까?`
    }
    this.dialog.open(DialogUser, {
      width : '250px',
      data : content
    })
    .afterClosed().subscribe(
      (res) => {
        if(res){
          let cpSelection = this.selection.selected;
          let target = row ? row.email : cpSelection.map(user => user.email);
          this.userMgmtSevice.userDeleteRequset(target)
          .subscribe(
            (res) => {
              // 삭제 대상이 단수일 경우
              this.notifier.notify('success', (res as any).message);
              if(target instanceof String){
                this.userList = this.userList.filter(el => {
                  return el.email != row.email;
                })
              } else {  // 삭제 대상이 복수일 경우
                // userList에서 selected에 있던 email로 필터링
                this.userList = this.userList.filter((obj) => {
                  return !cpSelection.some((obj2)=>{
                    return obj.email == obj2.email
                  })
                });
              }
            },
            (err) => {
              this.notifier.notify('error', err.error.message);
            }
          )
          // Dialog에서 확인을 눌렀으면 체크박스를 해제
          this.selection.clear();
        }
      }
    )
  }

  clickControlPacketLength(){
    this.userMgmtSevice.getPacketSize().subscribe((res) => {
      if(res.bufferSize){
        if(res.bufferSize instanceof String){
          res.bufferSize = parseInt(res.bufferSize);
        }
        var originSize = res.bufferSize;

        this.packetDialog.open(DialogFirmware, {
          width: '380px',
          data : originSize
        })
        .afterClosed().subscribe(
          (res) => {
            if(res){
              var packetSize = res;
              this.userMgmtSevice.setPacketSize(packetSize).subscribe((res) => {
                this.notifier.notify('success', `buffer size  changed to ${packetSize}`);
              }, err => {
                this.notifier.notify('error', err.message);
              })
            }
          }, err => {
            this.notifier.notify('error', "대화상자 생성 중 장애가 발생했습니다.");
          });
      }else{
        this.notifier.notify('error', "Invalid Packet Size!!");
      }
    }, err => {
      console.error(err);
    })
  }
}

export interface Element{
  email : String,
  name : String,
  lastAccess : String,
  admin : boolean
}

@Component({
  selector : 'dialog-user-remove',
  templateUrl : 'user-list.alert.html'
})
export class DialogUser{
  public title = "삭제";
  constructor(
    public dialogRef : MatDialogRef<DialogUser>,
    @Inject(MAT_DIALOG_DATA) public data : String
    ){}

  onNoClick = function() {
    this.dialogRef.close(false);
  }
}

@Component({
  selector : "dialog-firmware-size",
  templateUrl : 'update.confirm.html'
})
export class DialogFirmware {
  
  public bufferSize : Number;
  constructor(
    public dialogRef: MatDialogRef<DialogFirmware>,
    @Inject(MAT_DIALOG_DATA) public data : Number
  ){
    this.bufferSize = data;
  }

  onNoClick = function(){
    this.dialogRef.close(false);
  }
  apply = function(){
    if(this.bufferSize && parseInt(this.bufferSize) > 0){
      this.dialogRef.close(this.bufferSize);
    }else{
      console.error('Invalid packet size!!');
    }
  }
}