import { Component } from '@angular/core';
import * as Chartist from 'chartist';
import { EmployeeDataService } from '../services/employe-data.service';
import {  OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { lastValueFrom } from 'rxjs';
import { Organization, loggedInUser } from '../employee/table-list.component';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {
  totalEmployees: number = 0;
  private apiUrl =  `https://api.samotplatform.com/organizationemployees/`;


  constructor(private employeeDataService: DataService,private http:HttpClient) { }

 
  
  liveBalance:any=0;
  samotUser:any;
  creditLimit:number=0;
  user:any
  Balance:any;
  jsonParse:any
  credit:any;
  balance:any=0
  organization:number;
  Organizations: Organization[] = [];  //In Organizations array the employees organizations are stored 

 
 async ngOnInit() {
    // const options = {
    //   "Authorization": "Bearer " + localStorage.getItem('token')
    // };

    // try {
    //   const organizationsPromise = this.http.get<any[]>(`https://dgr.sso.id/myorganizations`, { headers: options });
    //   const loginUserPromise = this.http.get<any>(`https://dgr.sso.id/oauth2/me`, { headers: options });

    //   const organizations = await lastValueFrom(organizationsPromise);
    //   const loginUser = await lastValueFrom(loginUserPromise);

    //   organizations.forEach(element => {
    //     const find = loginUser.user_organizations.find(x => x.Name === element.Name);
    //     if (find) {
    //       this.Organizations.push(element);
    //     }
    //   });
      

    //   this.organization = this.Organizations[0].OrganizationId;
    //   await this.fetchEmployeesLength();

    //   /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */
    //   this.getme();
    //   this.getXeroBalance();
    //   this.getLiveBalance();
    // } catch (error) {
    //   console.error("An error occurred:", error);
    // }
   await this.employeeDataService.me();
    this.fetchEmployeesLength();
    this.getXeroBalance();

    this.getUsers();
  }

 fetchEmployeesLength() {
 
  var options = {
    Authorization: "Bearer " + localStorage.getItem("token"),
  };
  // console.log(this.selectedOption);
  this.http
    .get<any[]>(this.apiUrl+this.employeeDataService.organizationId, { headers: options })
    .subscribe((data) => {
      this.totalEmployees = data.length;
      // this.loading = false;
      // this.dataSource = new MatTableDataSource<user>(this.users);
      //  this.dataSource.paginator = this.paginator;
      // this.dataSource.paginator = this.paginator;
      // this.paginator.pageSize = this.selectedOption;

      // console.log(this.users);
    });
}

getUsers(): any {
  var options = {
    Authorization: "Bearer " + localStorage.getItem("token"),
  };
  // console.log(this.selectedOption);
  this.http
    .get<{ creditLimit: number }>(`https://api.samotplatform.com/users/`+this.employeeDataService.userId, { headers: options })
    .subscribe((data) => {
      this.creditLimit=data.creditLimit;
      // this.loading = false;
      // this.dataSource = new MatTableDataSource<user>(this.users);
      //  this.dataSource.paginator = this.paginator;
      // this.dataSource.paginator = this.paginator;
      // this.paginator.pageSize = this.selectedOption;

      // console.log(this.users);
      this.getLiveBalance();
    });
 }
 getXeroBalance():any{
    
  var options = {
    "Authorization": "Bearer " + localStorage.getItem('token')
  }
  
  this.http.get<any>(`https://api.samotplatform.com/xero/contactdetails`, {'headers':options})
  
  
 
  .subscribe(data => {
    this.Balance = data;
 this.jsonParse=JSON.parse(data.value);
this.balance=this.jsonParse.Contacts[0].Balances.AccountsReceivable.Outstanding
  this.getLiveBalance();
  });
}
getLiveBalance(){
  this.liveBalance=this.creditLimit-this.balance;
}
}
