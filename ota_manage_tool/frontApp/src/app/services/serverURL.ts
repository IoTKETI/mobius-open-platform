import { HttpClient, HttpBackend } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class UrlStore {
  public portalURL = "";
  public serviceUrl = {
    mobiusState : "",
    deviceManage : "",
    accessProtect : "",
    dataBrowser : "",
    resmon : "",
    ota : "",
    sns : "",
    dashboard : "",
  }
  public serverURL = "";
  public serverSocket = "";
  public domain = "";
  public apiConfig = "";
  
  private httpClient : HttpClient;
  constructor(handler : HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }
  
  loadURL() : Promise<any> {
    const promise = this.httpClient.get<any>('./api/auth/info', {
      responseType : "json"
    }).toPromise()
      .then(info => {
        var serviceUrl = info.serviceUrl;
        
        this.serviceUrl.mobiusState = `http://${serviceUrl.WEBPORTAL}/#!/dashboard`;
        this.serviceUrl.deviceManage = `http://${serviceUrl.WEBPORTAL}/#!/device-list`;
        this.serviceUrl.accessProtect = `http://${serviceUrl.WEBPORTAL}/#!/acp-list/`;
        this.serviceUrl.dataBrowser = `http://${serviceUrl.WEBPORTAL}/#!/data-browser/`;
        this.serviceUrl.resmon = `http://${serviceUrl.RES}`;
        this.serviceUrl.ota = `http://${serviceUrl.OTA}`;
        this.serviceUrl.sns = `http://${serviceUrl.SNS}`;
        this.serviceUrl.dashboard = `http://${serviceUrl.DASHBOARD}`;
        this.serverURL = `http://${serviceUrl.WEBPORTAL}`;
        this.portalURL = this.serverURL;
        this.domain = serviceUrl.domain;

        this.apiConfig = this.serverSocket = this.serviceUrl.ota;

      })
      .catch(err => {
        console.error(err);
      });

    return promise;
  }
}