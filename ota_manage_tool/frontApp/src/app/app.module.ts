import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms/';

import { CustomMaterialModule } from './core/custom-material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


/* Components & Services */
import { AppComponent } from './app.component';
import { LoginComponent } from './member/login/login.component';
import { RegisterComponent } from './member/register/register.component';
import { AeListComponent } from './aes/ae-list/ae-list.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { AuthService } from './services/auth.service';
import { UserMgmtService } from './services/user-mgmt.service';
import { TokenHttpInterceptor } from './core/tokenHttpInterceptor';
import { HeaderComponent } from './header/header/header.component';

/* Custom Dialogs */
import { DialogAEAlert, DialogUpload, DialogAdd }  from './aes/ae-list/ae-list.component';
import { DialogUser } from './admin/user-list/user-list.component';
import { DialogFirmware } from './admin/user-list/user-list.component';
import { DialogHeaderLogout } from './header/header/header.component';

import { JwtHelperService } from '@auth0/angular-jwt';
import { WebsocketService } from './services/websocket.service';

// Notification Module(angular-notifier)
import { NotifierModule } from 'angular-notifier';

import { NgxSpinnerModule } from 'ngx-spinner';
import { NGX_MAT_FILE_INPUT_CONFIG } from 'ngx-material-file-input';
import { config } from 'rxjs';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProgressBarModule } from 'angular-progress-bar';
import { CookieService } from 'ngx-cookie-service';


import { UrlStore } from './services/serverURL';

export function get_urls(urlLoader : UrlStore) {
  return () => urlLoader.loadURL();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AeListComponent,
    UserListComponent,
    DialogAEAlert,
    DialogUpload,
    DialogAdd,
    DialogUser,
    DialogFirmware,
    HeaderComponent,
    DialogHeaderLogout,
    NotFoundComponent
  ],
  entryComponents : [
    DialogAEAlert,
    DialogUpload,
    DialogAdd,
    DialogUser,
    DialogFirmware,
    DialogHeaderLogout
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    CustomMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NotifierModule.withConfig({
      position : {
        horizontal : { position : 'middle', distance : 12 },
        vertical : { position : 'top', distance : 12}
      }
    }),
    ProgressBarModule
  ],
  providers: [
    UrlStore,
    {provide : APP_INITIALIZER, useFactory: get_urls, deps : [UrlStore],  multi : true},
    {provide : HTTP_INTERCEPTORS, useClass : TokenHttpInterceptor, multi : true},
    {provide : NGX_MAT_FILE_INPUT_CONFIG, useValue : config },
    JwtHelperService,
    AuthService,
    UserMgmtService,
    WebsocketService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
