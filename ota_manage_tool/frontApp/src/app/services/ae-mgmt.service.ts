import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlStore } from './serverURL';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AeMgmtService {

  private url : string;

  constructor(private http : HttpClient, private urlStore : UrlStore) { 
    this.url = this.urlStore.apiConfig + "/ae";
  }

  postNewAE(data, file : File){
    
    let formData = new FormData();
    formData.append('aeid' , data.aeid);
    formData.append('tag', data.tag ? data.tag : '');
    formData.append('version', data.version);
    formData.append('file', file, file.name);

    return this.http.post(this.url, formData);
  }

  getAEListByUser(email : string){
    
    return this.http.get(`${this.url}/list`, {
      params : {
        email : email
      }
    });
  }

  uploadNewFirmware(targetAE, version, file : File){
      let formData = new FormData();
      formData.append('aeid', targetAE);
      formData.append('version', version);
      formData.append('file', file, file.name);

      return this.http.post(`${this.url}/upload`, formData);
  }

  startPatch(aeid){
      return this.http.post(`${this.url}/patch`, {aeid : aeid});
  }

  finishPatch(aeid){
    return this.http.put(`${this.url}/patch`, {aeid : aeid});
  }

  deleteAE(aeid){
      return this.http.delete(`${this.url}`, {params : {aeid : aeid}});
  }
}
