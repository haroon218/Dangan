import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional, ViewChild, numberAttribute } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
interface Transaction {
  item: string;
  cost: number;
}
@Component({
  selector: 'app-fixed-salary-timesheet',
  templateUrl: './fixed-salary-timesheet.component.html',
  styleUrls: ['./fixed-salary-timesheet.component.css']
})
export class FixedSalaryTimesheetComponent {
   displayedColumns: string[] = ['select','item','Name', 'cost','grossPay','Bonus','Allowance','Deductions','BIK','TaxablePay','Expenses','Pension','Pensions'];
  
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  timesheet:any={};
  loading=false;
  timesheets:any[]=[]
  isEdit:boolean;
  employees: Employee[] = [];
  totalPay: number;
  selectedOption: string;
  selection = new SelectionModel<Employee>(true, []);
  selectedRow:any = {};
  selections = new SelectionModel<Employee>(true, []);
  dataSource = new MatTableDataSource<Employee>(this.employees);



  constructor(
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FixedSalaryTimesheetComponent>,
    private routers: Router,public dataservice:AdminDataServicesService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngOnInit() {
    this.selectedOption = this.data;
    if (this.data) {
     this.displayedColumns= ['item','Name', 'cost','grossPay','Bonus','Allowance','Deductions','BIK','TaxablePay','Expenses','Pension','Pensions'];
      this.isEdit = this.data.isEdit;
      this.dataservice.employees=[];
      // Edit mode - use existing data
      this.selectedRow = this.data[0];
      this.isStatusPendingOrApproved()

      this.timesheet = this.selectedRow;
      this.dataservice.employees=[];

      this.dataservice.startOfWeek=this.selectedRow.weekStartDate;
      this.dataservice.endOfWeek=this.selectedRow.weekEndDate;
      this.dataservice.selectedTimesheetType=this.selectedRow.type;
     
      this.selectedRow.timesheetEmployees.map((emp) => {
        
        var employee: any = {};

        employee.employeeId = emp.employeeId;
        employee.firstName = emp.employee.firstName;
        employee.lastName = emp.employee.lastName;
        employee.annualSalary = emp.employee.annualSalary;
        employee.TaxablePay = emp.TaxablePay;
        employee.bik = emp.bik;
        employee.bonus = emp.bonus;
        employee.otherAllowance = emp.otherAllowance
        employee.expenses = emp.expenses;
        employee.deductions = emp.deductions;
        employee.grossPay = emp.grossPay;
        employee.employeePensionContribution=emp.employeePensionContribution;
        employee.employeerPensionContribution=emp.employeerPensionContribution;

        this.dataservice.addEmployee(employee);  
        this.isEdit=false;
        
        // this.calculateGrossPay(employee.annualSalary)

        this.calculateTaxablePay(employee);
        this.calculateSubtotal();
        return employee;
      });
    
     
    }
    else{
      this.getEmployees();
      // this.selectedOption = this.dataservice.selectedOrganizationUnit;
    }
   
    
    
  }
  calculateTotalGrossPay(): number {
    return this.dataservice.employees.reduce((total, employee) => {
      return total + this.calculateGrossPay(employee.annualSalary);
    }, 0);
  }
  

  getEmployees(): any {
    this.loading = true;
  
    var options = {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    };
  
    let apiEndpoint: string;
  
    // Check if organization unit is defined
  
    if (this.dataservice.selectedOrganizationUnit) {
      // If organization unit is defined, fetch employees based on the organization unit
      apiEndpoint = `https://api.samotplatform.com/groups/employees/` + this.dataservice.selectedOrganizationUnit;
    } else {
      // If organization unit is not defined, fetch employees based on the organization
      apiEndpoint = `https://api.samotplatform.com/organizationemployees/` + this.dataservice.organization;
    }
  
  
    this.http.get<Employee[]>(apiEndpoint, { headers: options })
      .subscribe((data) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource<Employee>(this.employees);
        this.dataservice.employees = data;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      });
  }
  isStatusPendingOrApproved(): boolean {
    if (this.selectedRow && (this.selectedRow.status === 2 || this.selectedRow.status === 4)) {
      return false; 
    }
    return true; 
  }
calculateGrossPay(annualSalary: number): number {
  
    if (this.dataservice.selectedCycleId === 1 || this.selectedRow.payrollCycle===1) {
      
      return annualSalary / 52;
    } else if (this.dataservice.selectedCycleId === 2 || this.selectedRow.payrollCycle===2) {
      return (annualSalary / 52) * 2;
    } else if (this.dataservice.selectedCycleId === 3 || this.selectedRow.payrollCycle===3) {
      return (annualSalary / 12) ;
    } else {
      return 0;
    }
  }
  durationInSeconds=3
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
  handlePage(event: any) {}
 
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }
 
  calculateSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.TaxablePay || 0);
    }, 0);
  }
  calculateBonusSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.bonus || 0);
    }, 0);
  }
  calculatebikSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.bik || 0);
    }, 0);
  }
  calculatedeductionSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.deductions || 0);
    }, 0);
  }
  calculateexpensesSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.expenses || 0);
    }, 0);
  }
  calculatepensionSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.employeePensionContribution || 0);
    }, 0);
  }
  calculatepensionerSubtotal():number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.employeerPensionContribution || 0);
    }, 0);
  }
  calculateotherAllowanceSubtotal():number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.otherAllowance || 0);
    }, 0);
  }
  checkboxLabel(row?: Employee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index}`;
  }
  
  handleCheckboxChange( row: Employee): void {
    this.changeDetectorRefs.detectChanges();
    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected : undefined;
    // this.totalPay = this.selections.selected.reduce((total, employee) => total + this.calculatePay(employee), 0);

  }
  getTotalCost() {
    // return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  onInputChanged(employee: Employee): void {
    this.calculateTaxablePay(employee);
  }
  

  
  calculateTaxablePay(employee: Employee): number {
    const grossPay = this.calculateGrossPay(employee.annualSalary);
  
    const bonus = (employee.bonus || 0);
    const allowance = (employee.otherAllowance || 0);
    const deductions = (employee.deductions || 0);
    const bik = (employee.bik || 0);
  
    const taxablePay = grossPay + bonus + allowance - deductions + bik;
  
    // Assign the calculated taxablePay to the specific employee
    employee.TaxablePay = taxablePay;
  
    return taxablePay;
  }
  
  addTimesheet(): void {
    // ... (previous code)
    if (this.selection.isEmpty()) {
      this.openSnackBar('Please select at least one employee before creating a timesheet', false);
      return;
    }
    this.timesheet.organizationId = this.dataservice.organization;
    this.timesheet.groupId = this.dataservice.selectedOrganizationUnit;
    this.timesheet.type = this.dataservice.selectedTimesheetType;
    this.timesheet.payrollcycle = this.dataservice.selectedcycle;
    this.loading=true;
    this.timesheet.subtotal = this.calculateSubtotal();
    if (this.timesheet.payrollcycle === 3) {
      this.timesheet.monthNumber = this.dataservice.month.toString();
      this.timesheet.year = this.dataservice.year.toString();
    }
  if(this.timesheet.type===1){
    this.timesheet.weekStartDate = this.dataservice.startOfWeek;
    this.timesheet.weekEndDate = this.dataservice.endOfWeek;
  }
    if (this.timesheet.type === 2 && (this.timesheet.payrollcycle === 1 || this.timesheet.payrollcycle === 2)) {
      this.timesheet.weekStartDate = this.dataservice.startOfWeek;
      this.timesheet.weekEndDate = this.dataservice.endOfWeek;
    }
    const apiEndpoint = this.dataservice.selectedOrganizationUnit ?
    `https://api.samotplatform.com/Timesheets` :
    `https://api.samotplatform.com/organization/timesheet`;
    // Modify the block for type 1
    if (this.timesheet.type == 1) {
      this.timesheet.timesheetEmployees = this.dataservice.employees
        .filter(emp => this.selection.isSelected(emp))
        .map(emp => {
          return {
            employeeId: emp.employeeId,
            employeeShifts: emp.employeeShifts,
            expenses: emp.expenses,
            organizationId: this.dataservice.organization,
            groupId: this.dataservice.selectedOrganizationUnit,
            deductions: emp.deductions,
            grossPay: emp.grossPay
          };
        });
    } 
    // Modify the block for type 2
    else if (this.timesheet.type == 2) {
      this.timesheet.timesheetEmployees = this.dataservice.employees
        .filter(emp => this.selection.isSelected(emp))
        .map(emp => {
          return {
            employeeId: emp.employeeId,
            organizationId: this.dataservice.organization,
            groupId: this.dataservice.selectedOrganizationUnit,
            bonus: emp.bonus,
            otherAllowance: emp.otherAllowance,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
            bik: emp.bik,
            expenses:emp.expenses,
            employeePensionContribution: emp.employeePensionContribution,
            employeerPensionContribution: emp.employeerPensionContribution,
          };
        });
    }
  
  
    const options = {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    };
   this.loading=true;
    this.http.post(apiEndpoint, this.timesheet, { headers: options })
      .pipe(
        catchError(error => {
          // Handle errors
          return throwError(error);
        })
      )
      .subscribe(data => {
        this.loading=false;
        this.openSnackBar('Timesheet Created Successfully', true);
        this.dialogRef.close(data);
      });

  }
  
  updateTimesheet(){
    this.timesheet.organizationId=this.dataservice.organization;
    this.timesheet.type = this.dataservice.selectedTimesheetType;
    this.timesheet.subtotal=this.calculateSubtotal();
    this.timesheet.weekStartDate=this.dataservice.startOfWeek;
    this.timesheet.weekEndDate=this.dataservice.endOfWeek;
    this.loading=true;
    const apiEndpoint = this.dataservice.selectedOrganizationUnit ?
    `https://api.samotplatform.com/Timesheets/` :
    `https://api.samotplatform.com/organization/timesheets/`;
    if( this.timesheet.type==1){
      //Update TimeSheet And Approvers Status
    if( this.timesheet.status==3){
      this.timesheet.timesheetApprovers.forEach(element => {
          if( element.status==3 || element.status == 2){
            element.status = 1;
            this.timesheet.status = 1;
            this.timesheet.currentApproverOrder=1;

          }
      });
    }
    //----------------------------------- 
      this.timesheet.timesheetEmployees= this.dataservice.employees.map(emp => {
        return {
          organizationId:this.timesheet.organizationId,
          groupId:this.timesheet.groupId,
          timesheetId : this.timesheet.timesheetId,
          employeeId: emp.employeeId, 
          employeeShifts: this.timesheet.timesheetEmployees.employeeShifts,
          expenses: emp.expenses,
          deductions: emp.deductions,
        };
      });
    }
    else if (this.timesheet.type == 2){
      //Update TimeSheet And Approvers Status
    if( this.timesheet.status==3){
      this.timesheet.timesheetApprovers.forEach(element => {
          if( element.status==3 || element.status == 2){
            element.status = 1;
            this.timesheet.status = 1;
            this.timesheet.currentApproverOrder=1;

          }
      });
    }
    //----------------------------------- 
      this.timesheet.timesheetEmployees= this.dataservice.employees.map(emp => {
        return {
          organizationId:this.timesheet.organizationId,
          groupId:this.timesheet.groupId,
          timesheetId : this.timesheet.timesheetId,
          employeeId: emp.employeeId, 
          bonus: emp.bonus, 
          otherAllowance: emp.otherAllowance,
          deductions: emp.deductions,
          bik: emp.bik,
          expenses: emp.expenses,
          taxablepay:emp.TaxablePay,
          employeePensionContribution : emp.employeePensionContribution,
          employeerPensionContribution : emp.employeerPensionContribution,

        };
      });
    }
    if(!this.dataservice.selectedOrganizationUnit){
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };
    this.loading=true;
    this.http.put(apiEndpoint + this.timesheet.timesheetId, this.timesheet, { 'headers': options })
    .pipe(
      catchError(error => {
        if (error.status >= 400 && error.status < 500) {
          this.openSnackBar('Client error occurred:  ' + error.status,false);
          this.loading=false;
        } else if (error.status >= 500) {
          this.openSnackBar('Server error occurred: ' + error.status,false);
          this.loading=false;
        } else {
          this.openSnackBar('An error occurred: ' + error.status,false);
          this.loading=false;

        }
        return throwError(error);
      })
    ) 
      .subscribe(data => {
        this.loading=false;
         this.timesheets.push(this.data);
        const index = this.timesheets.findIndex(e => e.timesheetId === this.timesheet.timesheetId);
            if (index !== -1) {
              this.timesheets[index] = data; // Update the existing employee in the local array
            }
        this.dialogRef.close( data );
        this.openSnackBar("Timesheet updated Successfully",true);

      });
    }else{
      this.timesheet.GroupId = this.dataservice.selectedOrganizationUnit;
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
      this.http.put(`https://api.samotplatform.com/Timesheets/` + this.timesheet.timesheetId, this.timesheet, { 'headers': options })
      .pipe(
        catchError(error => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar('Client error occurred:  ' + error.status,false);
            this.loading=false;
          } else if (error.status >= 500) {
            this.openSnackBar('Server error occurred: ' + error.status,false);
            this.loading=false;
          } else {
            this.openSnackBar('An error occurred: ' + error.status,false);
            this.loading=false;
  
          }
          return throwError(error);
        })
      ) 
        .subscribe(data => {
          this.loading=false;
           this.timesheets.push(this.data);
          const index = this.timesheets.findIndex(e => e.timesheetId === this.timesheet.timesheetId);
              if (index !== -1) {
                this.timesheets[index] = data; // Update the existing employee in the local array
              }
          this.dialogRef.close( data );
          this.openSnackBar("Timesheet updated Successfully",true);
  
        });
    }
  }
  
  cancelDialog(){
    this.timesheet={};
    this.dialogRef.close();
    
  }
}

export interface Employee {
  name: string;
  hours: number;
  extraHours: number;
  extra: number;
  totalPay:number;
  calculatePay:number;
  TaxablePay: number;
  annualSalary:number;
  bonus:number;
  otherAllowance:number;
  deductions:number;
  bik:number;
  
}

export interface PeriodicElement {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  gender: number;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  zipCode: string;
  email: string;
  salary: number;
  employeeStatus: number;
  pay: number;
  flag: 10;
}

interface HourlyRates {
  
  

}

