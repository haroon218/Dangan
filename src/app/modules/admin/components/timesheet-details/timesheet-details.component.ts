import { ChangeDetectorRef, Component, Inject, Optional, ViewChild } from '@angular/core';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup } from '@angular/forms';
import moment, { Moment } from 'moment';
import { MatCalendarCellCssClasses, MatDatepicker } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
export const MY_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};
@Component({
  selector: 'app-timesheet-details',
  templateUrl: './timesheet-details.component.html',
  styleUrls: ['./timesheet-details.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
      { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TimesheetDetailsComponent {
  timeSheet:any;
  
    employees: Employee[] = [];
    selectedWeek: number;
    Ounits: Ounit[] = [];
    edit:string;
    totalPay: number;
    timesheet:any = {};
    selectedOption: number;
    selectedOrgUnit: number;
    selection = new SelectionModel<Employee>(true, []);
    selectedRow:any = {};
    selections = new SelectionModel<Employee>(true, []);
    loading=false;
    selectedcycle:number;
    dataSource = new MatTableDataSource<Employee>(this.employees);
    //selectedTimesheetType: number;
    selectedType:number;
    isEdit:boolean;
    totalGrossPay : number;
    campaignOne:any;
    gettype:any;
    Cycle:any;
    selectype:number;
    cycles:string[]=['Weekly','Bi-weekly','Monthly']
    weeks: string[] = [];  
    timesheetTypes: any[] =[
      {
      id: 1,
      name: "Hourly"
      },
      {
        id: 2,
        name: "Fixed"
      }
  ];
  payrollCycle: any[] =[
    {
    id: 1,
    name: "Weekly"
    },
    {
      id: 2,
      name: "Bi-Weekly"
    },
    {
      id: 3,
      name: "Monthly"
    },
  ];
    ssoUrl='https://dgr.sso.id/';
    baseUrl='https://api.samotplatform.com/';
  
    displayedColumns: string[] = ['item','Name', 'cost','grossPay','Bonus','Allowance','Deductions','BIK','TaxablePay','Expenses','Pension','Pensions'];
    displayedTotalGrossPay: number;
  
    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    durationInSeconds=1;
  
    constructor(private _liveAnnouncer: LiveAnnouncer,public dataService: AdminDataServicesService,public dialog:MatDialog,private http: HttpClient,public Headercds:ChangeDetectorRef,public dialogRef: MatDialogRef<TimesheetDetailsComponent>,public service:AdminDataServicesService,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any)  {
        this.timeSheet=JSON.parse(data.timesheetState);
       
      }
    ngOnInit() {
      const currentDate = moment();
      this.setMonthAndYear(currentDate, null);

      this.dataService.selectedTimesheetType = 1; 
      
      if (this.data) {
        this.gettype = this.timeSheet.Type;
        this.Cycle = this.timeSheet.PayrollCycle;
        this.dataService.detailemployees=[];
        this.dataService.startOfWeek=this.timeSheet.WeekStartDate;
        this.dataService.endOfWeek=this.timeSheet.WeekEndDate;
        var employee: any = {};
        this.timeSheet.TimesheetEmployees.map((emp) => {
          
  
          employee.employeeId = emp.Employee.EmployeeId;
          employee.firstName = emp.Employee.FirstName;
          employee.lastName = emp.Employee.LastName;
          employee.annualSalary = emp.Employee.AnnualSalary;
           employee.TaxablePay = emp.TaxablePay;
          employee.bik = emp.BIK;
          employee.bonus = emp.Bonus;
          employee.otherAllowance = emp.OtherAllowance
          employee.expenses = emp.Expenses;
          employee.deductions = emp.Deductions;
          employee.grossPay = emp.GrossPay;
          employee.employeePensionContribution=emp.employeePensionContribution;
          employee.employeerPensionContribution=emp.employeerPensionContribution;
  
          employee.employeeShifts = emp.employeeShifts;
          this.dataService.addEmployees(employee);  
          this.calculateGrossPay(employee.annualSalary)
          this.calculateTaxablePay(employee);

          this.calculateSubtotal();
          return employee;
        });
      
       
      }
  
    
    
    this.dataService.selectedcycle = 3;
    this.dataService.selectedCycleId = this.payrollCycle[2].id;
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    // Correct handling of month indexing
    this.dataService.startOfWeek = new Date(today.setDate(diff));
    this.dataService.endOfWeek = new Date(today.setDate(diff + 6));
  
    this.campaignOne = new FormGroup({
      start: new FormControl(this.dataService.startOfWeek),
      end: new FormControl(this.dataService.endOfWeek),
    });
  
    this.campaignOne.valueChanges.subscribe((value) => {
      if (value.start instanceof Date) {
        this.dataService.startOfWeek = value.start;
      }
  
      if (value.end instanceof Date) {
        this.dataService.endOfWeek = value.end;
      }
  
      this.generateWeeksAndDays();
    });
  
    if (this.data) {
    
      this.campaignOne.setValue({
        start: this.timeSheet.WeekStartDate,
        end: this.timeSheet.WeekEndDate,
      });
      
    }
    }
    date = new FormControl(moment());

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ): void {
    const month: number = normalizedMonthAndYear.month() + 1;
    const year: number = normalizedMonthAndYear.year();
    
    if (this.data) {
      this.dataService.month = parseInt(this.timeSheet.MonthNumber, 10);
      this.dataService.year = parseInt(this.timeSheet.Year, 10);
    } else {
      this.dataService.month = month;
      this.dataService.year = year;
    }
  
    // Parse the string into a date object
    const newDate = moment()
    .year(this.dataService.year)
    .month(this.dataService.month - 1)
    .date(1);  
    // Change the format of the new date
    const formattedDate = newDate.format('MM/YYYY'); // Change the format here
  const momentDate = moment(formattedDate, 'MM/YYYY');
    // Set the value of the FormControl to the formatted date
    this.date.setValue(momentDate);
  
    // Close the datepicker if provided
    if (datepicker) {
      datepicker.close();
    }
  }
    
    calculateGrossPay(annualSalary: number): number {
  
      if (this.dataService.selectedCycleId === 1) {
        
        return annualSalary / 52;
      } else if (this.dataService.selectedCycleId === 2) {
        return (annualSalary / 52) * 2;
      } else if (this.dataService.selectedCycleId === 3) {
        return (annualSalary / 52) * 4;
      } else {
        return 0;
      }
    }
  
    
    onPayrollCycleChange(event: any) {
      
       this.dataService.selectedCycleId = event.value;
      // console.log('Selected Payroll Cycle ID:', this.dataService.selectedCycleId);
    }
    generateWeeksAndDays(): void {
      
  
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
  
      let currentWeekStartDate = firstDayOfMonth;
      let currentWeekEndDate = firstDayOfMonth;
  
      while (currentWeekEndDate <= lastDayOfMonth) {
        // Calculate the end date of the current week
        currentWeekEndDate = new Date(
          currentWeekEndDate.getFullYear(),
          currentWeekEndDate.getMonth(),
          currentWeekEndDate.getDate() + 6
        );
  
        // Format the week number and days
        const weekNumber = this.getWeekNumber(currentWeekStartDate);
        const weekLabel = `Week ${weekNumber}: ${currentWeekStartDate.toLocaleDateString()} - ${currentWeekEndDate.toLocaleDateString()}`;
  
        // Add the week label to the array
        this.weeks.push(weekLabel);
        // console.log(this.dataService.selectedTimesheetType);
  
        // Move to the next week
        currentWeekStartDate = new Date(currentWeekEndDate.getFullYear(), currentWeekEndDate.getMonth(), currentWeekEndDate.getDate() + 1);
        currentWeekEndDate = currentWeekStartDate;
        
      }
    }
    calculateTotalGrossPay(): number {
      return this.dataService.detailemployees.reduce((total, employee) => {
        return total + this.calculateGrossPay(employee.annualSalary);
      }, 0);
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
    
    getWeekNumber(date: Date): number {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    }
    getWeekNumberAndDatesFromLabel(weekLabel: string): string {
      // Extract week number from the label (assuming it starts with 'Week {number}:')
      const regex = /Week (\d+):/;
      const match = weekLabel.match(regex);
      const weekNumber = match ? match[1] : 0;
    
      // Extract start and end dates from the label
      const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}) - (\d{1,2}\/\d{1,2}\/\d{4})/;
      const dateMatch = weekLabel.match(dateRegex);
      const startDate = dateMatch ? dateMatch[1] : '';
      const endDate = dateMatch ? dateMatch[2] : '';
    
      return `Week ${weekNumber}: ${startDate} - ${endDate}`;
    }
   
    calculateSubtotal(): number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.TaxablePay || 0);
      }, 0);
    }
    calculateBonusSubtotal(): number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.bonus || 0);
      }, 0);
    }
    calculatebikSubtotal(): number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.bik || 0);
      }, 0);
    }
    calculatedeductionSubtotal(): number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.deductions || 0);
      }, 0);
    }
    calculateexpensesSubtotal(): number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.expenses || 0);
      }, 0);
    }
    calculatepensionSubtotal(): number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.employeePensionContribution || 0);
      }, 0);
    }
    calculatepensionerSubtotal():number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.employeerPensionContribution || 0);
      }, 0);
    }
    calculateotherAllowanceSubtotal():number {
      return this.dataService.detailemployees.reduce((subtotal, employee) => {
        return subtotal + (employee.otherAllowance || 0);
      }, 0);
    }
  
    canceldialog(){
        this.dialogRef.close();
    }
  
    // onInputChanged(): void {
    //   this.calculateTotalPay();
    // }
    
    // calculatePay(employee: Employee): number {
    //   const standardHourlyRate = 10;
    //   const extraHourlyRate = 10;
    
    //   const standardPay = employee.hours * standardHourlyRate;
    //   const extraPay = employee.extraHours * extraHourlyRate;
    
    //   const totalPay = standardPay + extraPay;
      
    //   // Assign the calculated totalPay to the specific employee
    //   employee.totalPay = totalPay;
    
    //   return totalPay;
    // }
   
  
    handleGrandTotalChanged(totalGrossPay: number): void {
      // Update the displayedTotalGrossPay property
      this.displayedTotalGrossPay = totalGrossPay;
    }
    // calculateTotalPay(): void {
    //   this.totalPay = this.selection.selected.reduce((total, employee) => total + this.calculatePay(employee), 0);
    // }
    
    cancelDialog(){
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
  export interface Ounit {
   GroupName:string;
   GroupId:number;
   idpId:string;
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
  

