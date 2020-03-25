import { Component, OnInit, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { BotService } from '../services/bot.service';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { throwError, pipe } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebsocketService } from '../services/websocket.service';
@Component({
  selector: 'app-bot-view',
  templateUrl: './bot-view.component.html',
  styleUrls: ['./bot-view.component.css'],
})
export class BotViewComponent implements OnInit {

  @Input() botID : String;
  private botName = null;

  public requesterList : Array<Element>
  public userList : Array<Element>

  public requestSelection : SelectionModel<Element>;
  public userSelection : SelectionModel<Element>;

  public displayedColumn = ['checked', 'userName', 'date'];

  constructor(
    private router : Router,
    private botService : BotService,
    private authService : AuthService,
    private ngxServcie : NgxSpinnerService,
    private notifier : NotifierService,
    private dialog : MatDialog,
    private wsService : WebsocketService) { 

    this.requesterList = [];
    this.userList = [];
    this.requestSelection = new SelectionModel<Element>(true, []);
    this.userSelection = new SelectionModel<Element>(true, []);

    this.wsService.connect().subscribe(
      data => {
        var botID = data.botID;
        var requester = data.requester;

        this.addRequester(botID, requester);
      },
      err => {
        this.notifier.notify('error', err.message);
      }
    )
  }

  ngOnInit() {
    /** Get User ID from Token **/
    this.ngxServcie.show();
    this.authService.userAuthentiate()
    .subscribe(rs => {
      this.botService.getBotInfo(this.botID).subscribe(
        res => {
          if(res.request){
            let cpList = new Array<Element>();
            res.request.forEach(el => {
              cpList.push({
                id : el._id,
                chatID : el.chatID,
                userName : el.userName,
                date : el.date
              })
            });
            this.requesterList = cpList;
          }
  
          if(res.validUser){
            let cpList = new Array<Element>();
            res.validUser.forEach(el => {
              cpList.push({
                id : el._id,
                chatID : el.chatID,
                userName : el.userName,
                date : el.date
              })
            });
            this.ngxServcie.hide();
            this.userList = cpList;
          }
        },
        err => {
          this.ngxServcie.hide();
          this.notifier.notify('error', err.error.message);
        }
      )
    })
  }

  //table : true requester, false : user
  isAllSelected(table) {
    const numSelected = table ? this.requestSelection.selected.length : this.userSelection.selected.length;
    const numRows = table ? this.requesterList.length : this.userList.length;
    return numSelected === numRows;
  }

  //table : true requester, false : user
  removeSelectedRows(table) {
    if(table){
      this.requestSelection.selected.forEach(item => {
       let index: number = this.requesterList.findIndex(d => d === item);
       console.log(this.requesterList.findIndex(d => d === item));
       this.requesterList.splice(index,1);
     });
    }else{
      this.userSelection.selected.forEach(item => {
        let index: number = this.userList.findIndex(d => d === item);
        console.log(this.userList.findIndex(d => d === item));
        this.userList.splice(index,1);
      });
    }
    if(table){
      this.requestSelection = new SelectionModel<Element>(true, []);
    }else{
      this.userSelection = new SelectionModel<Element>(true, []);
    }
  }

  /** Selects all row **/ 
  //table : true requester, false : userws if they are not all selected; otherwise clear selection. */
  masterToggle(table) {
   if( this.isAllSelected(table)){
     table ? this.requestSelection.clear() : this.userSelection.clear();
   }else{
     table ? 
      this.requesterList.forEach(row => this.requestSelection.select(row))
    :
      this.userList.forEach(row => this.userSelection.select(row));
   }
  }

  onClickToValidUser(){
    if(!this.requestSelection.hasValue()){return}
    let target = new Array();
    this.requestSelection.selected.forEach(el => {
      target.push(el.id);
    })
    if(!target || target.length < 1) return;
    let cp = this.requestSelection.selected;
    this.botService.toUser(this.botID, target).subscribe(
      res => {
        this.requesterList = this.requesterList.filter(obj1 => {
          return !cp.some(obj2 => {
            return obj1.id == obj2.id
          })
        });
        this.userList = this.userList.concat(cp);
      },
      err => {
        this.notifier.notify('error', err.error.message);
      },
      () => {
        this.requestSelection.clear();
      }
    )
  }

  onClickToRequest(){
    if(!this.userSelection.hasValue()){return}
    let target = new Array();
    this.userSelection.selected.forEach(el => {
      target.push(el.id);
    })
    if(!target || target.length < 1) return;
    let cp = this.userSelection.selected;
    this.botService.toRequester(this.botID, target).subscribe(
      res => {
        this.userList = this.userList.filter(obj1 => {
          return !cp.some(obj2 => {
            return obj1.id == obj2.id
          })
        });
        this.requesterList = this.requesterList.concat(cp);
      },
      err => {
        this.notifier.notify('error', err.error.message);
      },
      () => {
        this.userSelection.clear();
      }
    )
  }

  onClickRemove(){
    if(!(this.requestSelection.hasValue() || this.userSelection.hasValue())){return;}
    this.dialog.open(DialogBotListDelete, {
      width : '250px'
    }).afterClosed().subscribe(
      rs => {
        if(!rs){ return;}
        let validTarget = new Array();
        let requestTarget = new Array();

        this.userSelection.selected.forEach(el => {
          validTarget.push(el.id);
        });
        this.requestSelection.selected.forEach(el => {
          requestTarget.push(el.id);
        });
        //삭제 날리기
        this.botService.removeRequester(this.botID, validTarget, requestTarget).subscribe(
          rs => {
            if(validTarget.length > 0){
              this.userList = this.userList.filter(obj1 => {
                return !validTarget.some(obj2 => {
                  return obj1.id == obj2;
                })
              });
            }
            if(requestTarget.length > 0){
              this.requesterList = this.requesterList.filter(obj1 => {
                return !requestTarget.some(obj2 => {
                  return obj1.id == obj2;
                })
              });
            }
          },
          err => {
            this.notifier.notify('error', err.error.message);
          },
          () => {
            this.requestSelection.clear();
            this.userSelection.clear();
          }
        )
      }
    )
  }

  addRequester(botID, requester){
    if(this.botID == botID){
      this.requesterList = this.requesterList.concat([{
        id : requester._id,
        chatID : requester.chatID,
        userName : requester.userName,
        date : requester.date
      }])
    }
  }
}


export interface Element{
  id : string,
  chatID : string;
  userName : string,
  date : string
}

/*
 * List 삭제
 */
@Component({
  selector : 'dialog-delete',
  templateUrl : 'bot-view.delete-dialog.html'
})
export class DialogBotListDelete{
  constructor(
    public dialogRef : MatDialogRef<DialogBotListDelete>
  ){}
}