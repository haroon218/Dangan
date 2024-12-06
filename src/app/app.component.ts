import { Component} from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { DataService } from 'app/modules/user/services/data.service';
import { AdminDataServicesService } from './modules/admin/components/services/admin-data-services.service';
// import { LoggedInUser } from './modules/user/user-panel/login/login.component';
import { lastValueFrom } from 'rxjs';


let routingService:any;
// let userDataService:any;
// let adminDataServices:any;
let code: string;
let state: string;
export interface loggedInUser {
  user_id : number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  status: string;
  user_roles:any[];

}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

   constructor(public service:DataService,public adminService:AdminDataServicesService,public http:HttpClient,public router:Router) {
    // userDataService = userService;
    // adminDataServices = adminService;
    
    
  }
   async ngOnInit() {
   
  
  }
  // async me(): Promise<void> {
  //   const token = localStorage.getItem('token');
  // if(token){
  //   const options = { "Authorization": "Bearer " + token };
  
  //   try {
  //     const data = await lastValueFrom(
  //       this.http.get<any>(`https://dgr.sso.id/oauth2/me`, { headers: options })
  //     );
  
  //     console.log(data);
  
  //     if (data != null && data.user_roles && data.user_roles.length > 0) {
  //       this.service.organizationName=data.user_organizations[0].Name;
  //       this.service.organizationId=data.user_organizations[0].OrganizationId;
  //       this.service.userId=data.user_id;
  //       const role = data.user_roles[0];
  //       if (role === 'Admin') {
  //         this.adminService.loggedInAdmin = data;
  //       } else if (role === 'Approver') {
  //         this.service.Approver = data;
  //       } else if (role === 'Client' || role === 'Approver' || role === 'User') {
  //         this.service.loggedInUser = data;
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // }
  
  // }
    
  
}