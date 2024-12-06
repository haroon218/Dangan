import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { element } from 'protractor';
import { EventEmitter, Output } from '@angular/core';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { TimesheetEmplyeesRateComponent } from '../timesheet-emplyees-rate/timesheet-emplyees-rate.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Subscription, catchError, throwError } from 'rxjs';
export interface Detail{

}
@Component({
  selector: 'app-hourly-timesheet',
  templateUrl: './hourly-timesheet.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  
  styleUrls: ['./hourly-timesheet.component.css']
})
export class HourlyTimesheetComponent {
jobDetails:Detail[]=[];
  employees: Employee[] = [];
  columnNames: string[] = [];
  // rates: string[] = [];
  loading =false;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  displayedTotalGrossPay: number;
timesheet:any={};
private totalPaySubscription: Subscription;
  dynamicSelectOptions: any[] = [];
  totalpay: number;
  selectedOption: number;
  selection = new SelectionModel<Employee>(true, []);
  selectedRow:any = {};
  selections = new SelectionModel<Employee>(true, []);
timesheets:any=[];
  dataSource = new MatTableDataSource<Employee>(this.employees);
  totalGrossPay: number = 0;
  isEdit: boolean;
  expandedRows: any[] = [];
  displayedColumns: string[] = ['select','fname','Lname','Expenses','deduction','pay'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  form: FormGroup;
  newDataRowForm: FormGroup;
  expandedElement:TimesheetEmplyeesRateComponent  | null;
  constructor(
    public dialog: MatDialog,
    public dataService: AdminDataServicesService,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    public dialogRef: MatDialogRef<HourlyTimesheetComponent>,
    private routers: Router,private fb: FormBuilder,private _snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataService.totalGrossPay=0;
    this.dataService.displayedTotalGrossPay=0;

  }
 
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngOnInit() {
    this.selectedRow = this.data;
    if (this.data) {
      this.columnsToDisplayWithExpand= ['fname','Lname','Expenses','deduction','pay','expand'];

      this.isEdit = this.data.isEdit;

      this.dataService.employees=[];
      this.selectedRow = this.data[0];
      this.isStatusPendingOrApproved()

      this.timesheet = this.selectedRow;
      this.dataService.employees=[];
      this.dataService.startOfWeek=this.selectedRow.weekStartDate;
      this.dataService.endOfWeek=this.selectedRow.weekEndDate;
      this.dataService.selectedTimesheetType=this.selectedRow.type;
      this.dataService.selectedcycle=this.selectedRow.payrollCycle;

      this.selectedRow.timesheetEmployees.map((emp) => {
        var employee: any = {};

        employee.employeeId = emp.employeeId;
        employee.firstName = emp.employee.firstName;
        employee.lastName = emp.employee.lastName;
        employee.expenses = emp.expenses;
        employee.deductions = emp.deductions;
        employee.grossPay = emp.grossPay;
        this.dataService.displayedTotalGrossPay=this.selectedRow.subTotal;
        employee.employeeShifts = emp.employeeShifts;
       
        this.dataService.addEmployee(employee);  
        this.isEdit=false;
        return employee;
      });
    
     
    }
    else{

      this.getEmployees();
      this.selectedOption = this.dataService.selectedOrganizationUnit;
    }

    this.initializeForm();
    // this.dataService.calculateTotalGrossPay();
  // this.onInputChanged(element)
  }
  durationInSeconds=5
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
  
  handleExpansionClick(event: Event): void {
    // Prevent the row from collapsing when clicking inside the expanded content
    event.stopPropagation();
  }
 
  getEmployees(): any {
    this.loading = true;
  
    var options = {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    };
  
    let apiEndpoint: string;
  
    // Check if organization unit is defined
  
    if (this.dataService.selectedOrganizationUnit) {
      // If organization unit is defined, fetch employees based on the organization unit
      apiEndpoint = `https://api.samotplatform.com/groups/employees/` + this.dataService.selectedOrganizationUnit;
    } else {
      // If organization unit is not defined, fetch employees based on the organization
      apiEndpoint = `https://api.samotplatform.com/organizationemployees/` + this.dataService.organization;
    }
  
  
    this.http.get<Employee[]>(apiEndpoint, { headers: options })
      .subscribe((data) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource<Employee>(this.employees);
        this.dataService.employees = data;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      });
  }
  
 
 initializeForm() {
    this.form = this.fb.group({
      // Define your form controls here
      dropdown: ['', Validators.required],
      inputField: ['', Validators.required],
    });
  }
  // toggleRow(element: any) {
  //   this.expandedElement = this.expandedElement === element ? null : element;
  // }
  // Method to add a new row to the dataSource
  createNewRow(element: Employee): void {
    if (this.newDataRowForm.valid) {
      const newRow = { ...this.newDataRowForm.value };
      // Add your logic to handle the creation of the new row, e.g., push it to the data source
      // For example:
      this.initializeForm(); // Reset the form for the next row

      const data = this.dataSource.data.slice();
      data.push(newRow);
      this.dataSource.data = data;
    }
  }
  
  handlePage(event: any) {}
 
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
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
  
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  onInputChanged(employee: Employee): void {
    var totalPayForEmployeeShifts = 0;
    if(employee.employeeShifts!== undefined){
      totalPayForEmployeeShifts = employee.employeeShifts.reduce((totalPay, empShift) => {
        return totalPay + (empShift.totalPay || 0);
      }, 0);
    }
    if(employee.grossPay == null || undefined)
        employee.grossPay = 0;
    employee.grossPay = (totalPayForEmployeeShifts||0) + (employee.expenses || 0) - (employee.deductions || 0);
    
    
    // this.totalGrossPay = this.dataService.employees.reduce((total, emp) => {
    //   return total + (emp.grossPay || 0);
    // }, 0);
  this.dataService.calculateTotalGrossPay();
    this.changeDetectorRefs.detectChanges();
  }

  
 
  // calculateTotalPay(employee: Employee): void {
  //   const totalPay = employee.employeeJobs.reduce((sum, job) => sum + (Number(job.rate) || 0) * (job.hours || 0), 0);
  //   var gPay = totalPay + (employee.expenses || 0) - (employee.deductions || 0);
  //   employee.grossPay = gPay;
  // }

  addTimesheet(): void {
    const organizationData = JSON.parse(localStorage.getItem('Organization'));

if (organizationData && Array.isArray(organizationData.OrganizationUsers) && organizationData.OrganizationUsers.length === 0) {
  this.openSnackBar('No  Approvers are assigned for the organization.', false);
  return;
}
    if (this.selection.isEmpty()) {
      this.openSnackBar('Please select at least one employee before creating a timesheet', false);
      return;
    }
  
    // Check if this.dataService.employees is defined
    if (!this.dataService.employees || !Array.isArray(this.dataService.employees)) {
      this.openSnackBar('Error: Unable to retrieve employee data', false);
      return;
    }
   
    // Check if any employee in the timesheet has a missing shiftId, payRate, or totalHours
    const employeesWithMissingShift = this.dataService.employees.filter(emp => {
      return emp.employeeShifts && emp.employeeShifts.some(shift => shift.shiftId === undefined || shift.shiftId === null);
    });
  
    const employeesWithMissingPayRate = this.dataService.employees.filter(emp => {
      return emp.employeeShifts && emp.employeeShifts.some(shift => shift.payRate === undefined || shift.payRate === null);
    });
  
    const employeesWithMissingTotalHours = this.dataService.employees.filter(emp => {
      return emp.employeeShifts && emp.employeeShifts.some(shift => shift.totalHours === 0 || shift.totalHours === 0);
    });
  
    const selectedEmployeesWithNoEmployeeShifts = this.selection.selected.filter(emp => !emp.employeeShifts || emp.employeeShifts.length === 0);
  
    if (employeesWithMissingShift.length > 0) {
      const employeeNames = employeesWithMissingShift.map(emp => `${emp.firstName} ${emp.lastName}`).join(', ');
      this.openSnackBar(`Please select a shift for the (${employeeNames}) before creating a Timesheet`, false);
      return;
    }
  
    if (employeesWithMissingPayRate.length > 0) {
      const employeeNames = employeesWithMissingPayRate.map(emp => `${emp.firstName} ${emp.lastName}`).join(', ');
      this.openSnackBar(`Please select a pay rate for the (${employeeNames}) before creating a Timesheet`, false);
      return;
    }
  
    if (employeesWithMissingTotalHours.length > 0) {
      const employeeNames = employeesWithMissingTotalHours.map(emp => `${emp.firstName} ${emp.lastName}`).join(', ');
      this.openSnackBar(`Please enter Hours for shift for the (${employeeNames}) before creating a Timesheet`, false);
      return;
    }
  
    if (selectedEmployeesWithNoEmployeeShifts.length > 0) {
      const employeeNames = selectedEmployeesWithNoEmployeeShifts.map(emp => `${emp.firstName} ${emp.lastName}`).join(', ');
      this.openSnackBar(` Employee (${employeeNames}) has no Shifts. Please assign Shifts before creating a Timesheet.`, false);
      return;
    }
    if (!this.dataService.startOfWeek || !this.dataService.endOfWeek) {
      this.openSnackBar('Please select StartofWeek and EndofWeek Date', false);
      return;
    }
    this.timesheet.organizationId = this.dataService.organization;
    this.timesheet.groupId = this.dataService.selectedOrganizationUnit;
    this.timesheet.type = this.dataService.selectedTimesheetType;
    this.timesheet.subTotal = this.dataService.displayedTotalGrossPay;
    this.timesheet.weekStartDate = this.dataService.startOfWeek;
    this.timesheet.weekEndDate = this.dataService.endOfWeek;
    const apiEndpoint = this.dataService.selectedOrganizationUnit ?
    `https://api.samotplatform.com/Timesheets` :
    `https://api.samotplatform.com/organization/timesheet`;
    // Modify the block for type 1
    if (this.timesheet.type == 1) {
      this.timesheet.timesheetEmployees = this.dataService.employees
        .filter(emp => this.selection.isSelected(emp))
        .map(emp => {
          return {
            employeeId: emp.employeeId,
            employeeShifts: emp.employeeShifts,
            expenses: emp.expenses,
            organizationId: this.dataService.organization,
            groupId: this.dataService.selectedOrganizationUnit,
            deductions: emp.deductions,
            grossPay: emp.grossPay
          };
        });
    } 
    // Modify the block for type 2
    else if (this.timesheet.type == 2) {
      this.timesheet.timesheetEmployees = this.dataService.employees
        .filter(emp => this.selection.isSelected(emp))
        .map(emp => {
          return {
            organizationId: this.dataService.organization,
            employeeId: emp.employeeId,

            groupId: this.dataService.selectedOrganizationUnit,
            bonus: emp.bonus,
            otherAllowance: emp.otherAllowance,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
            bik: emp.bik,
            employeePensionContribution: emp.employeePensionContribution,
            employeerPensionContribution: emp.employeerPensionContribution,
          };
        });
    }
  
      this.timesheet.payrollcycle = 0;
  
    const options = {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    };
    this.loading = true;
  
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
  
  cancelDialog(){
    this.dataService.totalGrossPay=0;
    this.dataService.displayedTotalGrossPay=0;
    this.dialogRef.close();
    
  }
  isStatusPendingOrApproved(): boolean {
    if (this.selectedRow && (this.selectedRow.status === 2 || this.selectedRow.status === 4)) {
      return false; 
    }
    return true; 
  }
  updateTimesheet(){
    this.timesheet.organizationId=this.dataService.organization;
    this.timesheet.GroupId = this.dataService.selectedOrganizationUnit;
    this.timesheet.type = this.dataService.selectedTimesheetType;
    this.timesheet.subTotal=this.dataService.displayedTotalGrossPay;
    this.timesheet.weekStartDate=this.dataService.startOfWeek;
    this.timesheet.weekEndDate=this.dataService.endOfWeek;
    const apiEndpoint = this.dataService.selectedOrganizationUnit ?
    `https://api.samotplatform.com/Timesheets/` :
    `https://api.samotplatform.com/organization/timesheets/`;
    if( this.timesheet.type==1){
    //Update TimeSheet And Approvers Status
    if(this.timesheet.status==3){
      this.timesheet.timesheetApprovers.forEach(element => {
          if( element.status==3 || element.status == 2){
            element.status = 1;
            this.timesheet.status = 1;
            this.timesheet.currentApproverOrder=1;

          }
      });
    }
    //----------------------------------- 
      this.timesheet.timesheetEmployees= this.dataService.employees.map(emp => {
        return {
          organizationId:this.timesheet.organizationId,
          groupId:this.timesheet.groupId,
          timesheetId : this.timesheet.timesheetId,
          employeeId: emp.employeeId, 
          employeeShifts: this.timesheet.timesheetEmployees[0].employeeShifts,
          expenses: emp.expenses,
          deductions: emp.deductions,
          grossPay: emp.grossPay
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
      this.timesheet.timesheetEmployees= this.dataService.employees.map(emp => {
        return {
          employeeId: emp.employeeId, 
          bonus: emp.bonus,
          otherAllowance: emp.otherAllowance,
          deductions: emp.deductions,
          grossPay: emp.grossPay,
          bik: emp.bik,
          employeePensionContribution : emp.employeePensionContribution,
          employeerPensionContribution : emp.employeerPensionContribution,

        };
      });
    }
    const options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };
    this.loading = true;

    this.http.put(apiEndpoint+ this.timesheet.timesheetId, this.timesheet, { 'headers': options })
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
// export interface ColumnNames {
//   title: string;

  
// }

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

export interface PeriodicElement {
  employeeId: string;
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