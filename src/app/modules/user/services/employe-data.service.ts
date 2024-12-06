import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
// import { Employee } from '..//employee/table-list.component'; // Adjust the import path

@Injectable({
  providedIn: 'root'
})
export class EmployeeDataService {

  private apiUrl = `https://api.samotplatform.com/organizationemployees/`;
    private token = "";
  private options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    } 
    public month:any;
    public year:any;
    public isCurrentApproverquery:boolean;
    public selectedcycle:number;
    public selectedCycleId:number;
    public employeeInTimeSheet: Employee;
    public employees: any=[];
    public displayedTotalGrossPay:number;
    public organization:number;
    public startOfWeek:any;
    public  isCurrentApprover: boolean;
    public  updateTimeSheet: boolean;
    public endOfWeek:any;
    public totalGrossPay:number=0;
    public selectedTimesheetType:number;
    public selectedOrganizationUnit:number;
    public employeeShifts = [];
  constructor(private http: HttpClient) {   

  }
  setToken(accesstoken):any{
    this.token = accesstoken;
  } 
  addEmployee(employee: any) {
  
    this.employees.push(employee);
  }
  
 
  public updateEmployeeInArray(updatedEmployee: Employee): void {
    const updatedEmployees = this.employees.map((employee) =>
      employee.employeeId === updatedEmployee.employeeId ? { ...employee, ...updatedEmployee } : employee
    );
    this.employees.splice(0, this.employees.length);
    this.employees = [...updatedEmployees];
  }
  
  calculateTotalGrossPay(): void {
    this.totalGrossPay = this.employees.reduce((total, employee) => total + (employee.grossPay || 0), 0);
    this.displayedTotalGrossPay = this.totalGrossPay; // Update displayedTotalGrossPay property
  
  }

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
