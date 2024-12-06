import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AdminDataServicesService } from './modules/admin/components/services/admin-data-services.service';
import { DataService } from './modules/user/services/data.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private admindataservice: AdminDataServicesService,private http: HttpClient,private service:DataService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  
    return next.handle(request).pipe(
      catchError((error:HttpErrorResponse) => {
      let errorMessage = '';
      if(error.error instanceof ErrorEvent){
        errorMessage = `Error : ${error.error.message}`;
      }
      else
      {
        errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`;
      }
      if(error && error.status === 400 && error.error == "Refresh token get expired....")
      {
        const logoutLink = `https://dgr.sso.id/oauth/logout?client_id=qCsKVnvYyvOqLiJOJFApr&redirect_uri=${this.admindataservice.baseUrl}`;   
      }
      console.log(errorMessage);
      if(error && error.status === 401)
      {

        console.log("Token expired. Refreshing......");

        let refreshToken = localStorage.getItem("refreshToken");
        
        let apiUrl = `https://api.samotplatform.com/oauth/refreshtoken?refreshToken=${refreshToken}`;
        this.http.get<any>(apiUrl)
          .subscribe(data => {
            console.log(data);
           this.service.setToken(data.access_token, data.role, data.refresh_token);

          });
        
      }
      else
      {
        return throwError(() => new Error(errorMessage));
      }
     
    })
    );
  }
}
