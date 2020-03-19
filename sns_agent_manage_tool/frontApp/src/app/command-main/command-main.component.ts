import { Component, OnInit, ViewChild, ComponentFactoryResolver, Inject } from '@angular/core';
import { CommandViewDirective } from './command-main.directive';
import { BotService } from '../services/bot.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommandViewComponent } from '../command-view/command-view.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { BotViewDirective } from '../bot-view/bot-view.directive';
import { BotViewComponent } from '../bot-view/bot-view.component';

@Component({
  selector: 'app-command-main',
  templateUrl: './command-main.component.html',
  styleUrls: ['./command-main.component.css']
})
export class CommandMainComponent implements OnInit {

  public botList : Array<Element>;
  private userEmail : String;
  @ViewChild(BotViewDirective) memberRef;
  @ViewChild(CommandViewDirective) cmdRef
  constructor(private botService : BotService, private ngxService : NgxSpinnerService,
              private notifierService : NotifierService, private authService : AuthService,
              private componentFactoryResolver : ComponentFactoryResolver, private dialog : MatDialog) { 
                this.botList = new Array<Element>();
              }

  ngOnInit() {
    this.authService.getUserInfo().pipe(
      map((rs : any) => {
        this.ngxService.hide();
        return rs.u_e;
      })
      ,catchError(err => {
        return throwError(err);
      })
    ).subscribe(
      email => {
        this.userEmail = email;
        this.botService.getBotList(this.userEmail).subscribe(
          res => {
            res.data.forEach(b => {
              this.botList.push({
                botID : b._id,
                name : b.name,
                token : b.token,
                clicked : false
              } as Element)
            });

            this.loadComponent(this.botList[0], 0);
          },
          err => {
            this.notifierService.notify('error', err.error.message);
          },
          () => {
            this.ngxService.hide();
          }
        )
      },
      err => {
        this.ngxService.hide();
        this.notifierService.notify('error', err.error.message);
      },
      () => {
        this.ngxService.hide();
      }
    )
  }

  isClicked(){
    let cp = this.botList;
    for(let i = 0; i < cp.length; i++){
      if(cp[i].clicked) return true;
    }
    return false;
  }

  cancelClicked(){
    this.botList.forEach(bot => {
      bot.clicked = false;
    });
  }

  loadComponent(bot, i){
    let cmdViewContainerRef = this.cmdRef.viewContainerRef;
    cmdViewContainerRef.clear();
    this.cancelClicked();
    this.botList[i].clicked = true;
    let commandFactory = this.componentFactoryResolver.resolveComponentFactory(CommandViewComponent);
    
    let commandRef = cmdViewContainerRef.createComponent(commandFactory);
    (commandRef.instance).botID = bot.botID;
    

    let memberViewContainerRef = this.memberRef.viewContainerRef;
    memberViewContainerRef.clear();
    let reqFactory = this.componentFactoryResolver.resolveComponentFactory(BotViewComponent);
    
    let reqRef = memberViewContainerRef.createComponent(reqFactory);
    (reqRef.instance).botID = bot.botID;
  }

  openAddDialog(){
    this.dialog.open(DialogBotAdd, {
      width : '450px',
      panelClass : "botAddDialog"
    })
    .afterClosed().subscribe(
      newBot => {
        if(!newBot) return null;
        this.botService.addNewBot(this.userEmail, newBot).pipe(
          map(
            rs => {
              return rs.data
            }),
          catchError(err => {
            return throwError(err);
          })
        ).subscribe(
          rs => {
            this.botList = this.botList.concat([{
              name : rs.name,
              token : rs.token,
              botID : rs._id,
              clicked : false
            } as Element])
          },
          err => {
            this.notifierService.notify('error', err.message);
          }
        )
      },
      err => {
        this.notifierService.notify('error', err.message);
      }
    )
  }
  openDeleteDialog(bot, i){
    this.dialog.open(DialogBotDelete, {
      data : {
        botName : bot.name
      }
    }).afterClosed().subscribe(
      rs => {
        if(rs){
          this.botService.deleteBot(bot.botID).subscribe(
            rs => {
              this.botList.splice(i, 1);
            },
            err => {
              this.notifierService.notify('error', err.error.message || "삭제 중 장애가 발생했습니다.")
            }
          )
        }
      },
      err => {
        this.notifierService.notify('error', err.error.message || "삭제 중 장애가 발생했습니다.")
      }
    );
    event.stopPropagation();
  }
  openBotRegisterGuideDialog(){
    this.dialog.open(BotRegisterGuide,{
      width : '50%'
    })
  }
}


export interface Element{
  botID : String,
  name : String,
  clicked : boolean,
  token : string
}

/*
 * Bot 추가
 */
@Component({
  selector : 'dialog-add',
  templateUrl : 'bot-mgmt.add-dialog.html',
  styleUrls: ['./bot-mgmt.component.css']
})
export class DialogBotAdd{
  public form : FormGroup;
  public validToken : boolean;
  constructor(
    public dialogRef : MatDialogRef<DialogBotAdd>,
    public fb : FormBuilder,
    public userService : UserService,
    public notifierService : NotifierService,
    public ngxService : NgxSpinnerService
  ){
    this.form = fb.group({
      name : new FormControl('', [Validators.required]),
      token : new FormControl('', [Validators.required]),
      tag : new FormControl('', [Validators.required])
    });
    this.validToken = false;
  }

  onClick(){
    if(this.form.controls['token'].value && this.form.controls['token'].valid){
      if(this.form.valid) this.dialogRef.close({
        token : this.form.controls['token'].value,
        name : this.form.controls['name'].value,
        tag : this.form.controls['tag'].value,
      });
    }
  }
  checkValidToken(){
    var token = this.form.controls['token'].value;
    this.ngxService.show();
    this.userService.userCheckValidBot(token).subscribe(
      rs => {
        console.log(rs);
        if(rs.valid){
          this.validToken = true;
          this.form.controls['name'].setValue(rs.bot.name);
          this.form.controls['tag'].setValue(rs.bot.tag);
        }else{
          this.form.controls['token'].setErrors({invalid : true});
        }
      },
      err => {
        var error = err.error;
        console.error(err);
        this.notifierService.notify('error', (error && error.message) ? error.message : '서버와 통신이 원활하지 않습니다. 잠시후 시도해주세요');        
        this.ngxService.hide();
      },
      () => {
        this.ngxService.hide();
      }
    )
  }
}

@Component({
  selector : 'dialog-add',
  templateUrl : 'bot-mgmt.delete-dialog.html'
})
export class DialogBotDelete{
  public botName = null;
  constructor(
    public dialogRef : MatDialogRef<DialogBotDelete>,
    @Inject(MAT_DIALOG_DATA) public data
  ){
    this.botName = data.botName;
  }
}

@Component({
  selector : 'bot-register-guide',
  templateUrl : '../guide/bot-register-guide.html',
  styleUrls : ['../guide/dialog.css']
})
export class BotRegisterGuide{
  constructor(
    public dialogRef : MatDialogRef<BotRegisterGuide>
  ){}
}