import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { NotifierService } from 'angular-notifier';
import { NgxSpinnerService } from 'ngx-spinner';
import * as myGlobal from "../../services/server.url";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public formModel : FormGroup;
  constructor(
    private router : Router, 
    private userService : UserService,
    private notifier : NotifierService,
    private spinner : NgxSpinnerService) { 
    this.formModel = new FormGroup({
      'email' : new FormControl('', [
        Validators.email, Validators.required
      ]),
      'name' : new FormControl('', [
        Validators.required
      ]),
      'password' : new FormControl('',[Validators.required]),
      'repeatPassword' : new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
  }

  userSignUP(){
    event.preventDefault();

    if(!this.formModel.valid){
      this.notifier.notify('warning', '회원가입 양식에 맞게 입력해주세요');
      return;
    }
    let user = {
      email : this.formModel.value.email,
      password : this.formModel.value.password,
      name : this.formModel.value.name
    };
    this.userService.userSignUpRequest(user).subscribe(
      (res) => {
        this.notifier.notify('success', '회원가입을 성공적으로 마쳤습니다.');
        this.router.navigate(['./']);
      },
      (err) => {
        console.error(err);
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
  
  backLogin(){
    //window.location.href=myGlobal.portalURL+"/#!/login";
  }

  checkEmail() : Object{
    const email = this.formModel.value.email;
    if(!email || email == ""){
      return
    }else{
      this.userService.userCheckEmail(email)
      .subscribe(
        rs => {
          if(!rs){  // 사용하고 있는 Email
            this.formModel.controls['email'].setErrors({'overlap' : true});
            // return { overlap : true}
          }
        },
        err => {
          this.notifier.notify('error', err.error.message);
        }
      )
    }
  }

  checkValidToken(){
    const token = this.formModel.value.botToken;
    if(!token || token == ""){ return }
    this.spinner.show();
    this.userService.userCheckValidBot(token).subscribe(
      rs => {
        if(!rs) {
          this.formModel.controls['botToken'].setErrors({invalid : true});
        }
        this.spinner.hide();
        console.log(this.formModel.controls['botToken'].valid);
      },  
      err => {
        this.spinner.hide();
        this.notifier.notify('error', err.error.message|| "서버와 연결이 되지 않습니다.");
      }
    )
  }
}
