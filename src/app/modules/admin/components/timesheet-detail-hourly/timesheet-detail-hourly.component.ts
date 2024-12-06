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
  selector: 'app-timesheet-detail-hourly',
  templateUrl: './timesheet-detail-hourly.component.html',
  styleUrls: ['./timesheet-detail-hourly.component.css']
})
export class TimesheetDetailHourlyComponent {

  jobDetails:Detail[]=[];
  employees: Employee[] = [];
  columnNames: string[] = [];
  // rates: string[] = [];
  loading =false;
  timeSheet:any;
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
  displayedColumns: string[] = ['fname','Lname','Expenses','deduction','pay'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  form: FormGroup;
  newDataRowForm: FormGroup;
  expandedElement:TimesheetEmplyeesRateComponent  | null;
  constructor(
    public dialog: MatDialog,
    public dataService: AdminDataServicesService,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    public dialogRef: MatDialogRef<TimesheetDetailHourlyComponent>,
    private routers: Router,private fb: FormBuilder,private _snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.timeSheet=JSON.parse(data.timesheetState);
       
  }
 
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngOnInit() {
         

    if (this.data) {
      this.dataService.detailemployees=[];
      // Edit mode - use existing data
      this.dataService.detailemployees=[];
      this.dataService.subtotal=this.timeSheet.SubTotal;
      this.dataService.startOfWeek=this.timeSheet.WeekStartDate;
      this.dataService.endOfWeek=this.timeSheet.WeekEndDate;
      this.dataService.selectedTimesheetType=this.timeSheet.type;
      this.dataService.selectedcycle=this.selectedRow.PayrollCycle;

      this.timeSheet.TimesheetEmployees.map((emp) => {
        var employee: any = {};

        employee.employeeId = emp.EmployeeId;
        employee.firstName = emp.Employee.FirstName;
        employee.lastName = emp.Employee.LastName;
        employee.expenses = emp.Expenses;
        employee.deductions = emp.Deductions;
        employee.grossPay = emp.GrossPay;
        
        employee.employeeShifts = emp.EmployeeShifts;
       
        this.dataService.addEmployees(employee);  
        this.isEdit=false;
        return employee;
      });
    
     
    }
    else{
      this.getEmployees();
      this.selectedOption = this.dataService.selectedOrganizationUnit;
    }
   
    this.initializeForm();
    
  // this.onInputChanged(element)
    this.calculateTotalGrossPay();
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
  
  handleExpansionClick(event: Event): void {
    // Prevent the row from collapsing when clicking inside the expanded content
    event.stopPropagation();
  }
  ngAfterViewInit(): void {
    this.calculateTotalGrossPay(); // Call the calculation method in ngAfterViewInit
  }
  getEmployees(): any {
    var options = {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    };
    this.http.get<Employee[]>(`https://api.samotplatform.com/groups/employees/` + this.dataService.selectedOrganizationUnit, { headers: options })
      .subscribe((data) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource<Employee>(this.employees);
        this.dataService.employees = data;
         this.dataSource.paginator = this.paginator;
        //  this.dataSource.sort = this.sort;
        // this.paginator.pageSize = this.selectedOption;
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
    const totalPayForEmployeeJobs = employee.employeeShifts.reduce((totalPay, empJob) => {
      return totalPay + (empJob.totalPay || 0);
    }, 0);
  
    const totalPay = totalPayForEmployeeJobs + (employee.expenses || 0) - (employee.deductions || 0);
    employee.grossPay = totalPay;
    this.calculateTotalGrossPay();
  
    this.totalGrossPay = this.dataService.employees.reduce((total, emp) => {
      return total + (emp.grossPay || 0);
    }, 0);
  
    this.changeDetectorRefs.detectChanges();
  
  }

  calculateTotalGrossPay(): void {
    this.totalGrossPay = this.dataService.employees.reduce((total, employee) => total + (employee.grossPay || 0), 0);
    this.dataService.displayedTotalGrossPay = this.totalGrossPay; // Update displayedTotalGrossPay property
  }
 
  // calculateTotalPay(employee: Employee): void {
  //   const totalPay = employee.employeeJobs.reduce((sum, job) => sum + (Number(job.rate) || 0) * (job.hours || 0), 0);
  //   var gPay = totalPay + (employee.expenses || 0) - (employee.deductions || 0);
  //   employee.grossPay = gPay;
  // }

  
  
  cancelDialog(){
    this.timesheet={} ;
    this.dialogRef.close();
    
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
