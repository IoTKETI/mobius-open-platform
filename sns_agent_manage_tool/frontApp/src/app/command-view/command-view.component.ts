import { Component, OnInit, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommandService } from '../services/command.service';
import { NotifierService } from 'angular-notifier';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-command-view',
  templateUrl: './command-view.component.html',
  styleUrls: ['./command-view.component.css']
})
export class CommandViewComponent implements OnInit {

  @Input() botID : String;
  public commandList = new Array<Element>();
  public selection = new SelectionModel<Element>(true, []);
  public displayedColumn = ['checked', 'command','target', 'control'];

  constructor(
    private router : Router, private cmdServcie : CommandService, private notifier : NotifierService, 
    private dialog : MatDialog, private ngxService : NgxSpinnerService) { }

  ngOnInit() {
    this.getCommandByBotID();
  }

  getCommandByBotID(){
    this.ngxService.show();
    this.cmdServcie.getCommands(this.botID)
    .subscribe(
      data => {
        if(data.commands){
          let arr = new Array<Element>();
          data.commands.forEach(element => {
            arr.push({
              cmdID : element._id,
              command : element.command,
              method : element.method,
              target : element.target,
              activity : element.activity           
            } as Element)
          });
          this.ngxService.hide();
          this.commandList = arr;
        }
      },
      err => {
        this.ngxService.hide();
        this.notifier.notify('error', err.message);
      },
      () => {
        this.ngxService.hide();
      }
    )
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.commandList.length;
    return numSelected === numRows;
  }

  removeSelectedRows() {
     this.selection.selected.forEach(item => {
      let index: number = this.commandList.findIndex(d => d === item);
      this.commandList.splice(index,1);

    });
    this.selection = new SelectionModel<Element>(true, []);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.commandList.forEach(row => this.selection.select(row));
  }

  toggleCommandActivity(i) {
    this.selection.clear();
    this.cmdServcie.toggleCommandActivity(this.botID, this.commandList[i].cmdID).subscribe(
      (res : any) => {
        let data = res.data;
        this.commandList[i].activity = !this.commandList[i].activity;
      },
      err => {

        this.notifier.notify('error', err.message);
      }
    )
  }
  openAddDialog(){
    this.dialog.open(DialogAdd, {
      width : '55vw',
      panelClass : 'custom-dialog'
    }).afterClosed().subscribe(
      res => {
        if(!res){
          return;
        }
        this.ngxService.show()
        this.cmdServcie.addCommand(this.botID, res)
        .subscribe(
          (res : any) => {
            let data = res.data;
            let cp = this.commandList.concat();
            cp.push({cmdID : data._id,
              command : data.command,
              method : data.method,
              target : data.target,
              activity : data.activity,
              des : data.des
            } as Element);
            this.commandList = cp;
          },
          err => {
            this.notifier.notify('error', err.error.message);
          },
          () => {
            this.ngxService.hide();
          }
        )
      },
      err => {
        this.notifier.notify('error', err.message);
        this.ngxService.hide();
      }
    )
  }
  openModifyDialog(row, i){
    event.stopPropagation();
    this.selection.clear();
    this.dialog.open(DialogModify,{
      width : '280px',
      data : row,
      panelClass : 'custom-dialog'
    }).afterClosed().subscribe(
      res => {
        if(!res){
          return;
        }
        this.ngxService.show()
        this.cmdServcie.modifyCommand(this.botID, res).subscribe(
          (rs : any) => {
            let data = res; //server에서 온게 아니라 dialog에서 온거다
            let cp = this.commandList.slice(0); // copy without reference
            cp[i] = {
              cmdID : data.cmdID,
              command : data.command,
              method : data.method,
              target : data.target,
              des : data.des,
              activity : data.activity
            } as Element;
            this.commandList = cp;
            this.notifier.notify('success', rs.message)
          },
          err => {
            this.notifier.notify('error', err.message);           
          },
          () => {
            this.ngxService.hide();
          }
        )
      },
      err => {
        this.notifier.notify('error', err.message);
      },
      () => {
        this.selection.clear();
      }
    )
  }
  openDeleteManyAlert(){
    this.dialog.open(DialogDelete, {
      width : '250px'
    }).afterClosed().subscribe(
      res => {
        this.ngxService.show()
        var cmdIDs = new Array();
        let cpCmd = this.selection.selected;
        cpCmd.forEach(cmd => {
          cmdIDs.push(cmd.cmdID);
        });

        this.cmdServcie.deleteCommands(this.botID, cmdIDs).subscribe(
          (rs) => {
            this.commandList = this.commandList.filter(obj => {
              return !cmdIDs.some(obj2 => {
                return obj.cmdID == obj2
              })
            })
            this.notifier.notify('success', (rs as any).message);
          },
          err => {
            this.notifier.notify('error', err.message || "복수의 명령어 삭제에 실패했습니다.");
          },
          () => {
            this.ngxService.hide();
          }
        )
      },
      err => {
        this.notifier.notify('error', err.message);
      },
      () => {
        this.selection.clear();
      }
    );

  }
  openDeleteDialog(row, i){
    event.stopPropagation();
    this.selection.clear();
    this.dialog.open(DialogDelete, {
      width : '250px'
    }).afterClosed().subscribe(
      res => {
        if(!res){
          return;
        }
        this.ngxService.show()
        this.cmdServcie.deleteCommandActivity(this.botID, row.cmdID).subscribe(
          (rs) => {
            this.commandList = this.commandList.filter(el => {
              return el.cmdID != row.cmdID;
            });
          },
          err => {
            this.notifier.notify('error', err.message);
          },
          () => {
            this.ngxService.hide();
          }
        )
      },
      err => {
        this.notifier.notify('error', err.message);
      },
      () => {
        this.selection.clear();
      }
    )
  }
  changeActivityMany(target){
    let list = new Array;
    let cpSelected = this.selection.selected;
    cpSelected.forEach(el => {
      if(el.activity != target){
        list.push(el.cmdID);
      }
    });
    this.cmdServcie.changeActivityMany(this.botID, list, target).subscribe(
      res => {
        cpSelected.forEach(el => {
          if(el.activity != target){
            el.activity = target;
          }
        });
        this.notifier.notify('success', res.message);
      },
      err => {
        this.notifier.notify('error', err.message);
      },() => {
        this.selection.clear();
      }
    )
  }
}

export interface Element{
  cmdID : string;
  command : string;
  method : string;
  target : string;
  activity : boolean;
}

/*
 * Command 추가
 */
@Component({
  selector : 'dialog-addae',
  templateUrl : 'command-view.add-dialog.html',
  styleUrls: ['./command-view.dialog.css']
})
export class DialogAdd{

  public form : FormGroup;
  
  constructor(
    public dialogRef : MatDialogRef<DialogAdd>,
    private fb: FormBuilder
  ){
    this.form = this.fb.group({
      'command' : ['', [Validators.required, Validators.pattern('^[/?a-zA-Z0-9_]{0,}$')] ],
      'target' : ['', [Validators.required, Validators.pattern('(\\S+\\/\\S+)')]],
      'method' : ['get', Validators.required],
      'des' : ['']
    })
  }

  onClick = () => {
    if(!this.form.controls['method'].valid){
      this.form.controls['method'].setErrors({'required': true});
      if(!this.form.valid){
        return;
      }else{
        return;
      }
    }
    if(this.form.controls['command'].valid && this.form.controls['target'].valid && this.form.controls['method'].valid){
      var command = this.form.controls['command'].value;
      if(/^\/[a-zA-Z0-9_]{0,}$/.test(command)){
        command = /^\/([a-zA-Z0-9_]{0,})$/.exec(command)[1]
      }
      this.dialogRef.close({
        command : command,
        target : this.form.controls['target'].value,
        method : this.form.controls['method'].value,
        des : this.form.controls['des'].value
      });
    }
  }
}

/*
 * Command 수정
 */
@Component({
  selector : 'dialog-addae',
  templateUrl : 'command-view.modify-dialog.html',
  styleUrls: ['./command-view.dialog.css']
})
export class DialogModify{
  public form : FormGroup;
  
  constructor(
    public dialogRef : MatDialogRef<DialogAdd>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public origin : any
  ){
    this.form = this.fb.group({
      'command' : [origin.command, [Validators.required, Validators.pattern('^[/?a-zA-Z0-9_]{0,}$')] ],
      'target' : [origin.target, Validators.required ],
      'method' : [origin.method, Validators.required],
      'des' : [origin.des]
    })
  }

  onClick = () => {
    if(!this.form.controls['method'].valid){
      this.form.controls['method'].setErrors({'required': true});
      if(!this.form.valid){
        return;
      }else{
        return;
      }
    }
    
    if(this.form.controls['command'].valid && this.form.controls['target'].valid && this.form.controls['method'].valid){
      this.dialogRef.close({
        cmdID : this.origin.cmdID,
        command : this.form.controls['command'].value,
        target : this.form.controls['target'].value,
        method : this.form.controls['method'].value,
        des : this.form.controls['des'].value,
        activity : this.origin.activity
      });
    }
  }
}


/*
 * Command 삭제
 */
@Component({
  selector : 'dialog-addae',
  templateUrl : 'command-view.delete-dialog.html'
})
export class DialogDelete{
  constructor(
    public dialogRef : MatDialogRef<DialogDelete>
  ){}
}
