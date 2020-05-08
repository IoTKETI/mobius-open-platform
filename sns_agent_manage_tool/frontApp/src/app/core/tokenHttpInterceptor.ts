import { Injectable, Injector } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders, HttpEvent, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, catchError, flatMap, share, switchMap } from "rxjs/operators";
import { throwError } from 'rxjs/internal/observable/throwError'
import { Router } from '@angular/router';
import { AuthService } from "../services/auth.service";
import { UrlStore } from "../services/server.url";

@Injectable()
export class TokenHttpInterceptor implements HttpInterceptor{
    constructor(private router : Router, private inj : Injector){}

    inflightAuthRequset = null;

    private applyCredentials = (req : HttpRequest<any>, token : string) =>{
        return req.clone({
            setHeaders : {
                'ocean-ac-token' : token
            }
        })
    }

    intercept(req : HttpRequest<any>, next : HttpHandler) : Observable<HttpEvent<any>>{

        // Login, Signup have to pass setting token
        /* 

        */

        const auth = this.inj.get(AuthService);

        if(!this.inflightAuthRequset){
            this.inflightAuthRequset = auth.getToken();
        }
        
        return this.inflightAuthRequset.pipe(
            switchMap((newToken:string) =>{
                this.inflightAuthRequset = null;

                const authReq = this.applyCredentials(req, newToken ? newToken : '');

                return next.handle(authReq);
            })
            ,catchError(err => {
                // checks if a url is to an admin api or not
                if(err.status === 401){
                    const isFromRefreshTokenEndPoint = !err.success;
                    if(isFromRefreshTokenEndPoint){
                        auth.clearTokens();
                        //window.location.href=UrlStore.portalURL+"/#!/login"
                        return throwError(err);
                    }
                    if(!this.inflightAuthRequset){
                        this.inflightAuthRequset = auth.getNewAcessToken();

                        if(!this.inflightAuthRequset){
                            //remove existing tokens
                            auth.clearTokens();
                            //window.location.href=UrlStore.portalURL+"/#!/login"
                            return throwError(err);
                        }
                    }

                    return this.inflightAuthRequset.pipe(
                        switchMap((newToken : string) =>{
                            // unset inflight request
                            this.inflightAuthRequset = null;

                            // clone the original request
                            const authReqRepeat = this.applyCredentials(req, newToken);
                            return next.handle(authReqRepeat);
                        })
                    );
                } else {
                    auth.clearTokens();
                    //window.location.href=UrlStore.portalURL+"/#!/login"
                    // this.router.navigate(['/']);
                    return throwError(err);
                }
            })
        );
    }
}