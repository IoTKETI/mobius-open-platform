import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AdministorComponent } from './admin/administor/administor.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AdminGuardService } from './services/admin-guard.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { CommandMainComponent } from './command-main/command-main.component';
// import { BotMgmtComponent } from './bot-mgmt/bot-mgmt.component';
const routes: Routes = [
  {path : 'cmd', component : CommandMainComponent, canActivate : [AuthGuardService]},
  {path : 'admin', component : AdministorComponent, canActivate : [AdminGuardService]},
  // {path : 'join', component : RegisterComponent},
  {path : '', component : LoginComponent},
  {path : '**', component : NotFoundComponent}
];
  
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
