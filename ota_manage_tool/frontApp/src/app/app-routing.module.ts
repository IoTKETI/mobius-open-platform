import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './member/login/login.component';
import { RegisterComponent } from './member/register/register.component';
import { AeListComponent } from './aes/ae-list/ae-list.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { CheckTokenService } from './services/check-token.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AdminGuardService } from './services/admin-guard.service';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {path : '', component : LoginComponent, canActivate : [CheckTokenService]},
  // {path : 'signup', component : RegisterComponent},
  {path : 'ae', component : AeListComponent, canActivate : [AuthGuardService]},
  {path : 'admin', component : UserListComponent, canActivate : [AdminGuardService]},
  {path : '**', component : NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
