import { Component, OnInit } from '@angular/core';
import { UserMgmtService } from 'src/app/services/user-mgmt.service';
import { FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserVO } from 'src/app/vo/user';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public formModel : FormGroup;

  constructor(
    private router : Router, 
    private userMgmtService : UserMgmtService,
    private notifier : NotifierService,
    private ngxService : NgxSpinnerService) { 
    this.formModel = new FormGroup({
      'email' : new FormControl('', [
        Validators.email, Validators.required
      ]),
      'name' : new FormControl('', [
        Validators.required
      ]),
      'password' : new FormControl('',[Validators.required]),
      'repeatPassword' : new FormControl('', [Validators.required])
    })
  }

  ngOnInit() {
  }

  userSignUP(){
    event.preventDefault();

    let user = new UserVO(
      this.formModel.value.email,
      this.formModel.value.password,
      this.formModel.value.name
    );
    this.ngxService.show();
    this.userMgmtService.userSignUpRequest(user).subscribe(
      (res) => {
        this.ngxService.hide();
        this.notifier.notify('success', '회원가입에 성공했습니다. 로그인을 진행해주세요');
        this.router.navigate(['/']);
      },
      (err) => {
        this.ngxService.hide();
        this.notifier.notify('error', '회원가입에 실패했습니다.');
      }
    )
  }

  public equalValidator(){
    const pass = this.formModel.controls['password'].value;
    const repeat = this.formModel.controls['repeatPassword'].value;
    
    if(pass !== repeat){
      this.formModel.controls.repeatPassword.setErrors({equal : true});
    }
  }

  checkEmail() : Object{
    const email = this.formModel.value.email;
    if(!email || email == ""){
      return
    }else{
      this.userMgmtService.userCheckEmail(email)
      .subscribe(
        rs => {
          if(!rs){  // 사용하고 있는 Email
            this.formModel.controls['email'].setErrors({'overlap' : true});
          }
        },
        err => {
          this.notifier.notify('error', err.error.message);
        }
      )
    }
  }

  backLogin(){
    this.router.navigate(['/']);
  }
}
