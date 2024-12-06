import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { DataService } from 'app/modules/user/services/data.service';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user:any={};
  samotUser:any={};
  loading=false;
  constructor(private cdr:ChangeDetectorRef,private http:HttpClient,) { 

  }

  ngOnInit() {
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
    this.loading=true;
    this.http.get<loggedInUser>(`https://dgr.sso.id/oauth2/me`, {'headers': options})
    .subscribe((data:any) => {
      this.http.get<loggedInUser>(`https://api.samotplatform.com/users/`+data.user_id, {'headers': options})
      .subscribe(samotData => {
       this.loading=false;
       data.samotplatformMargin=samotData.samotPlatformMargin;
       data.creditLimit=samotData.creditLimit;
       this.user=data;
      });
      
   
    });

  
  }
  updateUser(){
   this.loading=true;
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
  
     this.samotUser.UserId = this.user.user_id;
     this.samotUser.FirstName = this.user.first_name;
     this.samotUser.LastName = this.user.last_name;
     this.samotUser.email = this.user.email;
     this.samotUser.samotplatformMargin = this.user.samotplatformMargin;
     this.samotUser.dob=this.user.date_of_birth;
     this.samotUser.country=this.user.country;
     this.samotUser.city=this.user.city;
     this.samotUser.address=this.user.address;
    this.samotUser.creditlimit=this.user.creditLimit;

    this.http.put(`https://api.samotplatform.com/users/`+this.samotUser.UserId,this.samotUser, {'headers': options})
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
  creditLimit:number;
  samotPlatformMargin:number;
  status: string;
  user_roles:any[];

}

