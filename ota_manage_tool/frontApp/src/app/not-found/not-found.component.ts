import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UrlStore } from "../services/serverURL";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private location : Location,
    private router : Router,
    private urlStore : UrlStore
  ) { }

  ngOnInit() {
  }

  back(){
    this.location.back();
  }

  main(){
    window.location.href=this.urlStore.portalURL+"/#!/login";
  }
}
