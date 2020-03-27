import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdministorComponent, DialogUser } from './admin/administor/administor.component';
import { CommandViewComponent } from './command-view/command-view.component';

import { BotViewComponent } from './bot-view/bot-view.component';
import { TopNaviComponent } from './top-navi/top-navi.component';

/* for Notificationi */
import { NotifierModule } from 'angular-notifier';

/* Custom Dialog */
import { DialogAdd, DialogModify, DialogDelete } from './command-view/command-view.component';
import { DialogBotListDelete } from './bot-view/bot-view.component';
import { DialogHeaderLogout } from './top-navi/top-navi.component';
/* Custom Serivce */
import { CommandService } from './services/command.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomMaterialModule } from './core/custom-material.module';
import { TokenHttpInterceptor } from './core/tokenHttpInterceptor';
import { WebsocketService } from './services/websocket.service';

import { NgxSpinnerModule } from 'ngx-spinner';
import { NotFoundComponent } from './not-found/not-found.component';
import { BotViewDirective } from './bot-view/bot-view.directive';
import { CommandMainComponent, DialogBotAdd, DialogBotDelete, BotRegisterGuide } from './command-main/command-main.component';
import { CommandViewDirective } from './command-main/command-main.directive';
import { CookieService } from 'ngx-cookie-service';

import { UrlStore } from './services/server.url';

export function get_urls(urlLoader : UrlStore) {
  return () => urlLoader.loadURL();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdministorComponent,
    CommandViewComponent,
    DialogAdd, 
    DialogModify, 
    DialogDelete, 
    DialogBotListDelete,
    DialogHeaderLogout,
    DialogUser,
    DialogBotAdd,
    DialogBotDelete,
    BotRegisterGuide,
    BotViewComponent, 
    TopNaviComponent,
    NotFoundComponent,
    BotViewDirective,
    CommandMainComponent,
    CommandViewDirective,
    // BotMgmtComponent
  ],
  entryComponents : [
    // Dialog
    DialogAdd, 
    DialogModify, 
    DialogDelete,
    BotRegisterGuide,
    DialogBotListDelete,
    DialogHeaderLogout,
    DialogUser,
    DialogBotAdd,
    DialogBotDelete,
    BotViewComponent,
    CommandViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NotifierModule.withConfig({
      position : {
        horizontal : { position : 'middle', distance : 12 },
        vertical : { position : 'top', distance : 12}
      }
    }),
    // Angular Material modules
    CustomMaterialModule,
    // for Spinner
    NgxSpinnerModule,
  ],
  providers: [
    UrlStore,
    {provide : APP_INITIALIZER, useFactory: get_urls, deps : [UrlStore],  multi : true},
    {provide : HTTP_INTERCEPTORS, useClass : TokenHttpInterceptor, multi : true},
    //Custom Services
    CommandService,
    WebsocketService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
