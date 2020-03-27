import { Component, OnInit, NgModule, Inject } from '@angular/core';
import { AeMgmtService } from 'src/app/services/ae-mgmt.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { JwtHelperService } from '@auth0/angular-jwt';
import { WebsocketService } from 'src/app/services/websocket.service';
import { NotifierService } from 'angular-notifier';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { UrlStore } from "../../services/serverURL";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-ae-list',
  templateUrl: './ae-list.component.html',
  styleUrls: ['./ae-list.component.css'],
})
export class AeListComponent implements OnInit {

  public aeList : Array<Element> = [];
  public progressVal = {};
  public formData;
  private uploadFile : File;
  private timeOuts = {};
  public selection = new SelectionModel<Element>(true, []);

  public displayedColumn = ['checked', 'aeid', 'tag', 'fileName', 'uploaded', 'patch', 'control'];

  constructor(
    private dialog : MatDialog, 
    private aeMgmtService : AeMgmtService, 
    private wsService : WebsocketService,
    private notifier : NotifierService,
    private ngxService : NgxSpinnerService,
    private authService : AuthService,
    private rotuer : Router,
    private cookie : CookieService,
    private urlStore : UrlStore) {

    this.formData = {
      aeid : null,
      tag : null,
      version : "0.0.1",
      fileName : null
    }
  }

  ngOnInit() {
    this.ngxService.hide();
    let token = this.cookie.get('ocean-ac-token');
    if(!token || token === "undefine"){
      this.notifier.notify('warning', "사용 전 로그인이 필요합니다.");
      window.location.href=this.urlStore.portalURL+"/#!/login";
      return;
    }
    let userEmail = new JwtHelperService().decodeToken(token).u_e;
    this.authService.userAuthentiate()
    .subscribe(rs => {
      this.aeMgmtService.getAEListByUser(userEmail)
      .subscribe(
        (res) => {
          let arr = new Array<Element>();
          (res as any).forEach(el => {
            arr.push({
              fileName : el.fileName,
              uploaded : el.uploaded,
              aeid : el.aeid,
              tag : el.tag,
              patched : el.patched,
              patchState: el.patchState,
              version : el.version,
              new : false,
              fl : el.patchState == 'FAILED' ? true : false,
              patching : el.patchState == 'PATHCING' ? true : false
            } as Element);
  
            //  patch state에 따라서 PATCHING인 경우 socket connect
            if(el.patchState === "PATCHING"){
              this.wsService.connect(el.aeid).subscribe(
                (data) => {
                  this.processWebSocketData(data);
                },
                (err) => {
                  console.error(err);
                }
              )
            }
  
            this.progressVal[el.aeid] = -1;
          });
          if(arr){
            this.aeList = arr;
          }
        },
        (err) => {
          this.notifier.notify('error', err.error.message || err.message);
        }
      );
    })
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.aeList.length;
    return numSelected === numRows;
  }

  removeSelectedRows() {
     this.selection.selected.forEach(item => {
      let index: number = this.aeList.findIndex(d => d === item);
      console.log(this.aeList.findIndex(d => d === item));
      this.aeList.splice(index,1);

    });
    this.selection = new SelectionModel<Element>(true, []);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.aeList.forEach(row => {
        this.selection.select(row); 
        if(row.new) row.new = false
        if(row.fl) row.fl = false
      });
  }

  onFileSelect(event){
    this.uploadFile = event.target.files[0];
    this.formData.fileName = this.uploadFile.name;
  }

  openPatchAlert(row){

    // TODO진혁, Patch 처리 통합
    var info; var target = [];
    if(row){
      if(row.patching){
        this.notifier.notify('warning', `${row.aeid}는 현재 패치 중입니다.`);
      }else{
        info = `${row.aeid} 패치를 작업을 하시겠습니까?`;
        target.push(row.aeid);
      }
    }else{
      const cpSelection = this.selection.selected;
      let checkNum = cpSelection.length;
      cpSelection.forEach((ae) => {
        if(ae.patching){
          this.notifier.notify('warning', `${ae.aeid}는 현재 패치 중입니다.`);
        }else{
          target.push(ae.aeid);
        }
      })
      info = `${checkNum}개의 AE에 패치 작업을 하시겠습니까?`;
    }

    // Cancel when empty targets
    if(target.length < 1){
      return;
    }
    this.openAlert(info).afterClosed().
      subscribe((result) =>{
        if(result){
          
          target.forEach((aename) => {
            this.aeList.find(ae => {
              return ae.aeid == aename
            }).patching = true;
            this.wsService.connect(aename).subscribe(
              (data) => {
                this.processWebSocketData(data);
              },
              (err) => {
                this.notifier.notify('error', err);
                console.error(err);
              } 
            )
          })
          
          this.aeMgmtService.startPatch(target).subscribe(
            (res : any) => {
              var text;
              if(target.length > 1){
                text = `${target.length}개의 AE에 패치 작업을 시작했습니다.`;
              }else{
                text = `${target}에 패치 작업을 시작했습니다.`;
              }
              this.notifier.notify('info', text);
            },(err) => {
              this.notifier.notify('error', err.error.message || err.message);
              console.error(err);
            }
          );
        }
        this.selection.clear();
      });
  }

  openDeleteAlert(row, i){

    let dialogRef = this.openAlert(`${row.aeid} 삭제 작업을 수행하시겠습니까?`);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        var tempList = this.aeList;
        this.aeMgmtService.deleteAE(row.aeid).subscribe(
        res => {
          console.log(res);

          this.aeList = tempList.filter(el => {
            return el.aeid != row.aeid
          })
          this.notifier.notify('success', `${row.aeid}삭제에 성공했습니다.`);
          this.selection.clear();
        },
        err => {
          this.notifier.notify('error', err.error.message || 'AE 삭제에 실패했습니다. 지속시 관리자에게 문의 바랍니다.');
          console.error(err);
        })
      }
    })
  }

  openAlert(content : String){
    const dialogRef = this.dialog.open(DialogAEAlert,{
      width : '250px',
      data : content,
      panelClass : 'custom-dialog'
    });
    return dialogRef;
  }

  openUploadDialog(row, i){
    this.dialog.open(DialogUpload, {
      width :'350px',
      data : this.aeList[i].version,
      panelClass : 'custom-dialog'
    }).afterClosed().subscribe(data => {
      this.selection.clear();
      if(!data){
        return;
      }
      /* 서버에 이미지 보내기 */
      this.ngxService.show();
      this.aeMgmtService.uploadNewFirmware(row.aeid, data.version, data.file)
      .subscribe(
        (res : any) => {
          this.aeList[i].fileName = res.data.fileName;
          this.aeList[i].uploaded = res.data.uploaded;
          this.aeList[i].new = true;
          this.notifier.notify('success', res.message);
        },
        (err) => {
          this.notifier.notify('error', err.error.message || err.message);
          this.ngxService.hide();
        },
        () => {
          this.ngxService.hide();
        }
      )
    })
  }

  openDeleteManyAlert(){
    
    const cpSelection = this.selection.selected;
    let checkNum = cpSelection.length;
    let DialogRef = this.openAlert(`${checkNum}개의 AE 삭제 작업을 수행하시겠습니까?`);
    DialogRef.afterClosed().subscribe(
      res => {
        
        if(res){
          // alert에서 '확인'을 클릭했다.
          let selectedAEs = new Array();
          cpSelection.forEach(el => {
            // Select에서 선택된 row들의 aeid를 리스트에 담는다.
            selectedAEs.push(el.aeid);
          });
          this.aeMgmtService.deleteAE(selectedAEs)
          .subscribe(
            rs => {
              if(!rs){ return }
              /* 리스트 새로고침 */
              this.aeList = this.aeList.filter((obj) => {
                return !cpSelection.some((obj2)=>{
                  return obj.aeid == obj2.aeid
                })
              });
              cpSelection.forEach(el => {
                delete this.progressVal[el.aeid]; 
              })
              this.notifier.notify('success', `${(rs as any).n }개의 AE 삭제에 성공했습니다.`)
              this.selection.clear();
            },
            err => {
              this.notifier.notify('error', err.error.message || err.message);
            }
          )
        }
      },
      err => {
        this.notifier.notify('error', err.error.message || err.message);
      }
    )
    this.selection.clear();
  }

  openAddAEDialog(){
    this.dialog.open(DialogAdd,{
      width : '350px',
      panelClass : 'custom-dialog'
    }).afterClosed().subscribe(
      res => {
        if(!res) {return} // '취소'는 무시
        this.ngxService.show();
        this.aeMgmtService.postNewAE(res, res.file)
        .subscribe(
          (res : any) => {
            let data = res.data;
            let cp = this.aeList.concat();
            cp.push({
              fileName : (data as any).fileName,
              uploaded : (data as any).uploaded,
              aeid : (data as any).aeid,
              tag : (data as any).tag,
              patched : (data as any).patched,
              version : (data as any).version,
              new : true
            }as Element)
            this.progressVal[data.aeid] = -1;
            //delete this.aeList;
            this.aeList = cp;
            this.ngxService.hide();
            this.notifier.notify('success', res.message || `성공적으로 ${data.aeid}를 저장했습니다.`);
          },
          err => {
            this.ngxService.hide();
            this.notifier.notify('error', err.error.message  || err.message);
          }
        )
      },
      err => {
        this.notifier.notify('error', err.error.message || err.message);
      },
      () => {
        this.selection.clear();
      }
    )
  }

  onClickRow(row : Element, ){
    if(row.new) row.new = !row.new;
    if(row.fl) row.fl = false
    this.selection.toggle(row);
  }


  processWebSocketData(data){
    if(data.length == 2){
      // Patch 결과 리턴
      var aeid = data[0].aeid;
      var aeDoc = data[0];

      
      let aeIdx = this.aeList.findIndex(ae => {
        return ae.aeid == aeid;
      });
      this.aeList[aeIdx].patched = aeDoc.patched;
      this.progressVal[aeid] = -1;
      this.aeList[aeIdx].fl = false;
      this.aeList[aeIdx].new = true;
      this.aeList[aeIdx].patching = false;
      this.notifier.notify('success', `${aeid} 패치가 완료되었습니다.`);
    
      // data[0] ae Model, data[1] error message, data[2] aename
    }else if( typeof(data[1]) == 'string'){
      var aeid = data[0].aeid;

      let aeIdx = this.aeList.findIndex(ae => {
        return ae.aeid == aeid;
      });

      this.progressVal[aeid] = -1;
      this.aeList[aeIdx].fl = true;
      this.aeList[aeIdx].new = false;
      this.aeList[aeIdx].patching = false;
      this.notifier.notify('error', `${aeid} 패치에 실패하였습니다. error : ${data[1]}`);
    }else{
      // 0 : seq, 1 : loop_time, 2 : aename
      var aename = data[2];
      let proc = Math.round((data[0] * 100) / data[1]);
      this.progressVal[aename] = proc;

      
    }
  }
}

export interface Element{
  fileName : string,
  uploaded : string,
  aeid : string;
  tag : string;
  patched : string;
  version : string;
  new : boolean;
  fl : boolean;
  patching : boolean;
}

@Component({
  selector : 'dialog-alter',
  templateUrl : 'ae-list.alert.html'
})
export class DialogAEAlert{
  constructor(
      public dialogRef : MatDialogRef<DialogAEAlert>,
      @Inject(MAT_DIALOG_DATA) public data : String
    ){}
    onNoClick() {
    this.dialogRef.close();
  }
}
/*
 * 펌웨어 등록 대화창
*/
@Component({
  selector : 'dialog-upload',
  templateUrl : 'ae-list.fileupload.html'
})
export class DialogUpload{
  public form : FormGroup;
  constructor(
    private fb : FormBuilder,
    public dialogRef : MatDialogRef<DialogUpload>,
    @Inject(MAT_DIALOG_DATA) public data : String
  ){
    this.form = fb.group({
      version : [this.data, Validators.required],
      file  : ['', Validators.required]
    })
  }

  onNoClick(){
    this.dialogRef.close();
  }

  onUpload(){
    if(!this.form.valid){
      /* Error Notification */
      return;
    }
    this.dialogRef.close({
      version : this.form.controls['version'].value,
      file : this.form.controls['file'].value.files[0]
    });
  }
}
/*
 * AE 추가 대화창
 */
@Component({
  selector : 'dialog-addae',
  templateUrl : 'ae-list.addae.html'
})
export class DialogAdd{
  
  public form : FormGroup;
  constructor(
    private fb : FormBuilder,
    public dialogRef : MatDialogRef<DialogUpload>
  ){
    this.form = this.fb.group({
      'aeid' : ['', Validators.required],
      'tag' : [''],
      'version' : ['', Validators.required],
      'file' : ['', Validators.required]
    })
  }

  onNoClick = () => {
    this.dialogRef.close();
  }

  addAE = () => {
    if(this.form.valid){
      this.dialogRef.close({
        aeid : this.form.controls['aeid'].value,
        tag : this.form.controls['tag'].value ? this.form.controls['tag'].value : null,
        version : this.form.controls['version'].value,
        file : this.form.controls['file'].value.files[0]
      });
    }
  }
}
