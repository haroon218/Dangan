import { Component } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { DataService } from 'app/modules/user/services/data.service';
const baseApi="https://api.samotplatform.com"
let code: string;
let state: string;
let dataService:any;
export interface AccessToken{
  access_token: string,
  role: string
}
let accessToken: AccessToken;
let routingService:any;
@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.css']
})
export class OauthComponent
{
     params:any;
    constructor(private route: ActivatedRoute,private router: Router, private http: HttpClient,private service:DataService) {
      routingService = router;
      dataService = service;
      this.route.queryParams.subscribe(params => {
        
        code=params["code"];
        state=params["state"];
      });
      this.authorize(code ,state);
      
    }
  authorize(code:any, state:any) : void{
    this.http.get(`https://api.samotplatform.com/oauth/callback?code=${code}&state=${state}`)
    .subscribe((data:any) => {
      dataService.setToken(data.access_token);
      if(data.role == "User")
        routingService.navigate(['/user/dashboard'])
      else
        routingService.navigate(['/admin/dashboard'])
    });
    // this.http.get(`https://api.samotplatform.com/oauth/callback?code=${code}&state=${state}`);
  }

}
