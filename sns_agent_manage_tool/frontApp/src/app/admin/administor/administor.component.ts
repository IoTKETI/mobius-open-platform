import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-administor',
  templateUrl: './administor.component.html',
  styleUrls: ['./administor.component.css']
})
export class AdministorComponent implements OnInit {

  private adminNum = 0;
  public userList : Array<Element>
  public displayedColumn = ['checked', 'email', 'name', 'control'];
  public selection = new SelectionModel<Element>(true, []);
  
  constructor(
    private userService : UserService,
    private router : Router,
    private notifier : NotifierService,
    private dialog : MatDialog,
    private ngxService : NgxSpinnerService
  ) {}

  ngOnInit() {
    this.ngxService.show();
    this.userService.getUserList().subscribe(
      rs => {
        if(rs){
          let cp = new Array<Element>();
          rs.userList.forEach(el => {
            cp.push({
              id : el._id,
              email : el.email,
              name : el.name,
              admin : el.admin
            })
          });
          this.userList = cp;
        }
      },
      err => {
        this.ngxService.hide();
        this.notifier.notify('error', err.error.message || "서버와 연결되어 있지 않습니다.");
      },
      () => {
        this.ngxService.hide();
      }
    )
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
      content = `${this.selection.selected.length}개의 채널을 삭제하시겠습니까?`
    }
    this.dialog.open(DialogUser, {
      width : '250px',
      data : {content : content}
    })
    .afterClosed().subscribe(
      (res) => {
        if(res){
          let cpSelection = this.selection.selected;
          let target = row ? row.id : cpSelection.map(user => user.id);
          this.userService.userDeleteRequset(target)
          .subscribe(
            (res) => {
              // 삭제 대상이 단수일 경우
              this.notifier.notify('success', (res as any).message);
              if(typeof(target) === 'string'){
                this.userList = this.userList.filter((obj) => {
                  obj.id !== target
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
}

export interface Element{
  id : String,
  email : String,
  name : String,
  admin : boolean
}

@Component({
  selector : 'dialog-user-remove',
  templateUrl : 'administor.delete.html'
})
export class DialogUser{
  private title = "삭제";
  constructor(
    public dialogRef : MatDialogRef<DialogUser>,
    @Inject(MAT_DIALOG_DATA) public data : String
    ){}

  onNoClick = ()=> {
    this.dialogRef.close(false);
  }
}