import { Component } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { DataService } from 'app/modules/user/services/data.service';
import { AdminDataServicesService } from 'app/modules/admin/components/services/admin-data-services.service';
import { lastValueFrom } from 'rxjs';
const baseApi="https://api.samotplatform.com"
let code: string;
let state: string;
let dataService:any;
export interface AccessToken{
  access_token: string,
  role: string,
}
let accessToken: AccessToken;
let routingService:any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
loading=false;
  constructor(private router: Router,private admindataservice: AdminDataServicesService, private http: HttpClient,private service:DataService) {

    
      
  }
  ngOnInit(): void {
    const token = localStorage.getItem('token');
   if(token){
  const options = { "Authorization": "Bearer " + token };
  this.http.get<any>(`https://dgr.sso.id/oauth2/me`, { headers: options })
    .subscribe(data => {
      console.log(data);
      if (data != null && data.user_roles && data.user_roles.length > 0) {
        const role = data.user_roles[0];
        if (role === 'Admin') {
          this.admindataservice.loggedInAdmin = data;
        }  else if (role === 'Client'|| role === 'Approver'||role === 'User') {
          this.service.loggedInUser = data;
          this.service.organizationName=data.user_organizations[0].Name;
          this.service.organizationId=data.user_organizations[0].OrganizationId;
          this.service.UserName=data.display_name;
          this.service.userId=data.user_id;
        }
      }
    });
}
    if (token) {
      const role = localStorage.getItem('roles');
      if (role) {
        switch (role) {
          case 'Admin':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'Approver':
            this.router.navigate(['/user/timeSheet']);
            break;
          case 'Client':
          case 'User':
            this.router.navigate(['/user/dashboard']);
            break;
          default:
            break;
        }
        return; 
      }
    }

    const code = localStorage.getItem("code");
    const state = localStorage.getItem("state");

    if (code === "null" && state === "null" && (!token) ) {
      this.redirectToSSO();
    }
    else if(!token){
      this.authorize(code,state);
    } 
}
redirectToSSO(){
  window.location.href = `https://dgr.sso.id/oauth/Authorize?client_id=qCsKVnvYyvOqLiJOJFApr&response_type=code&redirect_uri=${this.admindataservice.baseUrl}/&state=${this.admindataservice.baseUrl}`;
}
async authorize(code: any, state: any): Promise<void> {
  try {
    const data = await lastValueFrom(this.http.get<any>(`https://api.samotplatform.com/oauth/callback?code=${code}&state=${state}`));
    this.service.setToken(data.access_token, data.role, data.refresh_token);
    await this.me();
    switch (data.role) {
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Approver':
        this.router.navigate(['/user/timeSheet']);
        break;
      case 'Client':
      case 'User':
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        break;
    }
  } catch (error) {
  } 
}

async me(): Promise<void> {
  const token = localStorage.getItem('token');

  const options = { "Authorization": "Bearer " + token };

  try {
    const data = await lastValueFrom(
      this.http.get<any>(`https://dgr.sso.id/oauth2/me`, { headers: options })
    );

    console.log(data);

    if (data != null && data.user_roles && data.user_roles.length > 0) {
     
      const role = data.user_roles[0];
      
      if (role === 'Admin') {
        this.admindataservice.loggedInAdmin = data;
      }  else if (role === 'Client' || role === 'Approver' || role === 'User') {
        this.service.loggedInUser = data;
        this.service.organizationName=data.user_organizations[0].Name;
        this.service.organizationId=data.user_organizations[0].OrganizationId;
        this.service.UserName=data.display_name;
        this.service.userId=data.user_id;
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


}