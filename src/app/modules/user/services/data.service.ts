import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, lastValueFrom, map } from 'rxjs';
import { Employee } from '..//employee/table-list.component'; // Adjust the import path
import { Organization } from '..//organization/organization.component'; // Adjust the import path
import { Route, Router } from '@angular/router';
import { AdminDataServicesService } from 'app/modules/admin/components/services/admin-data-services.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public UserName:any;
  public userId:any;
  public organizationId:any;
  public organizationName:any;
  public organization:number;
  public selectedOrganizationUnit:number;
public Approver:any;
// public role:any;
routingService :any;
  public loggedInUser:loggedInUser;
  private options = {
    "Authorization": "Bearer " + localStorage.getItem('token')
  } 
  private apiUrl =  `https://api.samotplatform.com/organizationemployees/`;
    private token = "";
    private roles= "";
    public isrole:any;
  private headers = new HttpHeaders({
    'Authorization': 'Bearer '+ localStorage.getItem('token')
  });
 

  constructor(private http: HttpClient,private adminService:AdminDataServicesService,private router:Router) {
    
     this.me()

   }
   
  setToken(access_token,role,refresh_token):any{
    if(!role){
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);

    }else{
      this.token = access_token;
      this.roles=role;
      localStorage.setItem('token', access_token);
      localStorage.setItem('roles', role);
      localStorage.setItem('refreshToken', refresh_token);
    }
    this.updateHeaders();
   
  } 
    clearToken(): void {
    this.token = "";
    this.roles="";
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    this.updateHeaders(); // Ensure you are updating headers correctly if needed
}

  private updateHeaders(): void {
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
  }
  async getEmployees(){
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };  
    try{
       return await lastValueFrom( this.http.get<any[]>(this.apiUrl+this.organization,{ headers: options })
    );
  }
  catch(e){
    return null;
  }
   
  }
  async me(): Promise<void> {
    
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
  if(token){
    const options = { "Authorization": "Bearer " + token };
  
    try {
      const data = await lastValueFrom(
        this.http.get<any>(`https://dgr.sso.id/oauth2/me`, { headers: options })
      );
  
      // console.log(data);
  
      if (data != null && data.user_roles && data.user_roles.length > 0) {
       
        
        const role = data.user_roles[0];
        if (role === 'Admin') {
          this.adminService.loggedInAdmin = data;
        } else if (role === 'Client' || role === 'Approver' || role === 'User') {
          this.loggedInUser = data;
          this.organizationName=data.user_organizations[0].Name;
          this.organizationId=data.user_organizations[0].OrganizationId;
          this.UserName=data.display_name;
          this.userId=data.user_id;
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  }
  getUserOrganizations():any{
     this.http.get<Organization[]>(`https://api.samotplatform.com/userOrganizations`, { 'headers': this.headers })
    .subscribe(data=>{
        return data;
    });
  }
 
  
  // getuser(): Observable<string> {
  //   const token = localStorage.getItem('token');
    
  //   if (token) {
  //     const options = {
  //       headers: new HttpHeaders({
  //         "Authorization": "Bearer " + token
  //       })
  //     };

  //     return this.http.get<any>('https://dgr.sso.id/oauth2/me', options).pipe(
  //       map(data => {
  //         if (data && data.user_roles && data.user_roles.length > 0) {
  //           return data.user_roles[0]; // Return the first role as a string
  //         }
  //         return null; // Return null if no roles found
  //       })
  //     );
  //   } else {
  //     return null; // Return null if no token found
  //   }
  // }
    
  
  
}

export interface loggedInUser {
  user_id : number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  status: string;
  user_roles:any[];

}
// export interface loggedInUser {
//   user_id : number;
//   firstName:string;
//   lastName:string;
//   email: string;
//   margin:number;
//   status: string;
//   user_roles:any[];

// }