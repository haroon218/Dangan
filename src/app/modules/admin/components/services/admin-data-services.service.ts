import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, lastValueFrom, map } from 'rxjs';
import { user } from '../users/users.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminDataServicesService {
  private apiUrl = 'https://api.samotplatform.com/users';
  private apiUrlOrg = 'https://dgr.sso.id/myorganizations';
  // public baseUrl = 'https://app.samotplatform.com';
   public baseUrl = 'http://localhost:4200';  
  private token = ""; 
  private headers = new HttpHeaders({
    'Authorization': 'Bearer '+ localStorage.getItem('token')
  });
  totalPaySubject = new Subject<number>();
  public employeeInTimeSheet: Employee;
  public Organizations:any;
  public employeeInTimeSheets: Employees;
  public Cycle:number;
  public selectype:number;
  public selectedCycleId:number;
  public selectedcycle:number;
  public employees: any=[];
  public detailemployees: any=[];
  public contacts:any=[];
  public subtotal:number;
  public totalpay:number;
  public organization:number;
  public isEdit:true;
  public totalGrossPay: number = 0;
  public month:any;
  public year:any;
  private roles= "";

    public displayedTotalGrossPay:number=0;
    public selectedTimesheetType:number;
    public selectedOrganizationUnit:number;
    public employeeShifts = [];
    public startOfWeek:any;
    public endOfWeek:any;
    public loggedInAdmin:loggedInAdmin;
  constructor(private http: HttpClient,private router:Router) {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
   }
   setToken(access_token,role,refresh_token):any{
    if(!role){
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);

    }else{
    this.token = access_token;
    this.roles=role;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresToken', refresh_token);
    localStorage.setItem('roles', role);
     }  
    this.updateHeaders();
  } 
    clearToken(): void {
    this.token = "";
    this.roles="";
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('signup');
    this.updateHeaders(); 
}

  addEmployee(employee: any) {
  
    this.employees.push(employee);
  }
  
  addEmployees(employee: any) {
  
    this.detailemployees.push(employee);
  }
 

  private updateHeaders(): void {
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });
  }
  async getUsers(): Promise<any> {
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };   
  
    try {
      const response = await lastValueFrom(this.http.get<user[]>(this.apiUrl, { headers: options }));
      return response.length;
    } catch (error) {

    }
  }
 
  getOrganizations(): Observable<any> {
    return this.http.get<any>(this.apiUrlOrg, { headers: this.headers });
  }
  getOrganizationsLength(): Observable<any>{
    return this.http.get<any>(this.apiUrlOrg, { headers: this.headers }).pipe(
      map(org=>org.length)
    );
  }
  public calculateGrossPay(annualSalary: number): number {
    if (this.selectedCycleId === 1) {
      
      return annualSalary / 52;
    } else if (this.selectedCycleId === 2) {
      return (annualSalary / 52) * 2;
    } else if (this.selectedCycleId === 3) {
      return (annualSalary / 52) * 4;
    } else {
      return 0;
    }
  }
  // public updateEmployeeInArray(updatedEmployee: Employee): void {
  //   const updatedEmployees = this.employees.map((employee) =>
  //     employee.employeeId === updatedEmployee.employeeId ? { ...employee, ...updatedEmployee } : employee
  //   );
  //   this.employees.splice(0, this.employees.length);
  //   this.employees = [...updatedEmployees];
  // }
  calculateTotalGrossPay(): void {
    this.totalGrossPay = this.employees.reduce((total, employee) => total + (employee.grossPay || 0), 0);
    this.displayedTotalGrossPay = this.totalGrossPay; 
  
  }
  
  
  async getTimeSheetData(): Promise<any> {
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }

    const organizationUrl = `https://api.samotplatform.com/organization/timesheets`;
    const timesheetsUrl =  `https://api.samotplatform.com/Timesheets` ;
  
    try {
      const organizationRequest = this.http.get<any[]>(organizationUrl, { headers: options });
      const timesheetsRequest = this.http.get<any[]>(timesheetsUrl, { headers: options });
  
      const [organizationData, timesheetsData] = await Promise.all([
        lastValueFrom(organizationRequest),
        lastValueFrom(timesheetsRequest)
      ]);
  
      let status1Count = 0;
      let status2Count = 0;
      let status3Count = 0;
  
      organizationData.forEach((timesheet) => {
        if (timesheet.status === 4) {
          status1Count++;
        } else if (timesheet.status === 5) {
          status2Count++;
        } else if (timesheet.status === 1) {
          status3Count++;
        }
      });
  
      timesheetsData.forEach((timesheet) => {
        if (timesheet.status === 4) {
          status1Count++;
        } else if (timesheet.status === 5) {
          status2Count++;
        } else if (timesheet.status === 1) {
          status3Count++;
        }
      });
  
      return { status1Count, status2Count, status3Count };
    } catch (error) {
      // Handle errors here
      throw error; // re-throw the error to propagate it further if needed
    }
  }
  // getTimeSheet(): Observable<{ status1Count: number, status2Count: number }> {
  //   const options = {
  //     "Authorization": "Bearer " + localStorage.getItem('token')
  //   };
  
  //   const url1 = `https://api.samotplatform.com/organization/timesheets/`;
  //   const url2 = `https://api.samotplatform.com/Timesheets/organizationunit/`+this.selectedOrganizationUnit;
  
  //   // Making two separate HTTP requests and combining the results
  //   return forkJoin({
  //     data1: this.http.get<any[]>(url1, { headers: options }),
  //     data2: this.http.get<any[]>(url2, { headers: options })
  //   }).pipe(
  //     map(({ data1, data2 }) => {
  //       let status1Count = 0;
  //       let status2Count = 0;
  
  //       // Count timesheets with status 1 and status 2 from both datasets
  //       data1.forEach((timesheet) => {
  //         if (timesheet.status === 1) {
  //           status1Count++;
  //         } else if (timesheet.status === 2) {
  //           status2Count++;
  //         }
  //       });
  
  //       data2.forEach((timesheet) => {
  //         if (timesheet.status === 1) {
  //           status1Count++;
  //         } else if (timesheet.status === 2) {
  //           status2Count++;
  //         }
  //       });
  
  //       return { status1Count, status2Count };
  //     })
  //   );
  // }
}
export interface Employees {
  firstName:string;
  lastName:string;
  OrganizationId:number;
  GroupId:number;
  employeeId: string;
  name: string;
  hours: number;
  rate: string;
  pay:number;
  totalPay:number;
  calculatePay:number;
  title: string;
  columnName: string;
  employeeJobs:any[];
  shifts:any[];
  employeeShifts:any[];
  expenses:number;
  deductions:number;
  grossPay:number;
  netPay: number;
  totalGrossPay:number;


  
}
export interface Employee {
  firstName:string;
  lastName:string;
  OrganizationId:number;
  GroupId:number;
  employeeId: string;
  name: string;
  hours: number;
  rate: string;
  pay:number;
  totalPay:number;
  calculatePay:number;
  title: string;
  columnName: string;
  employeeJobs:any[];
  shifts:any[];
  employeeShifts:any[];
  expenses:number;
  deductions:number;
  grossPay:number;
  netPay: number;
  totalGrossPay:number;


  
}
export class employeeShift {
  OrganizationId:number;
  GroupId:number;
  employeeId:string;
  shiftId: number;
  payrate: number;
  mondayhours: number;
  tuesdayhours: number;
  wednesdayhours: number;
  thursdayhours: number;
  fridayhours: number;
  saturdayhours: number;
  sundayhours: number;
  totalhours: number;
  totalpay: number;

  
}
export interface loggedInAdmin {
  user_id : number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  status: string;
  user_roles:any[];

}