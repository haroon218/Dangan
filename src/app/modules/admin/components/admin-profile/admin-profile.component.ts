import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent {

  admin:any={};
  samotAdmin:any={};
  loading=false;
  constructor(private cdr:ChangeDetectorRef,private http:HttpClient,) { 

  }

  ngOnInit() {
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
    this.loading=true;
    this.http.get<loggedInUser>(`https://dgr.sso.id/oauth2/me`, {'headers': options})
    .subscribe(data => {
      this.http.get<loggedInUser>(`https://api.samotplatform.com/users/`+data.user_id, {'headers': options})
      .subscribe(samotData => {
       this.loading=false;
       data.samotPlatformMargin=samotData.samotPlatformMargin;
       data.creditLimit=samotData.creditLimit;
       this.admin=data;

      });
   
    });

  
  }
  updateUser(){

    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
  
     this.samotAdmin.UserId = this.admin.user_id;
     this.samotAdmin.FirstName = this.admin.first_name;
     this.samotAdmin.LastName = this.admin.last_name;
     this.samotAdmin.email = this.admin.email;
     this.samotAdmin.samotplatformMargin = this.admin.samotPlatformMargin;
     this.samotAdmin.dob=this.admin.date_of_birth;
     this.samotAdmin.country=this.admin.country;
     this.samotAdmin.city=this.admin.city;
     this.samotAdmin.address=this.admin.address;
    this.samotAdmin.creditlimit=this.admin.creditLimit;
    this.loading=true;
    this.http.put(`https://api.samotplatform.com/users/`+this.samotAdmin.UserId,this.samotAdmin, {'headers': options})
    .subscribe(data => {
      this.loading=false;
    
   
    });
  }
}
export interface user {
  id : string;
  fullName: string;
  email: string;
  margin:number;
  first_name:string;
  last_name:string;
  address:string;


}
export interface loggedInUser {
  user_id : number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  status: string;
  samotPlatformMargin:number;
  creditLimit:number;
  user_roles:any[];

}


