import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Input, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { DataService } from 'app/modules/user/services/data.service';
export interface Job {
  rate: number;
  title: string;
  hours: number;
  id:string;
}
@Component({
  selector: 'app-timesheet-emplyees-rate',
  templateUrl: './timesheet-emplyees-rate.component.html',
  styleUrls: ['./timesheet-emplyees-rate.component.css']
})
export class TimesheetEmplyeesRateComponent {
  // @Input() employee: Employee;
  selectedRow:any={};
  isEdit:boolean;
  private isAddJobExecuted = false;
    finaldata:any;
  hoursInput: { [key: string]: any } = {};
  currentDate = new Date();
  daysOfWeek : any[]=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  dynamicSelectOptions: any[] = [];
  selectedOption: number;
  employeeShifts: any[] = [];
  jobs: any[] = [];
  getHours:any;
  shifts: any[] = []
  empJob:any = [
    
   this.getLabelDate(1),
   this.getLabelDate(2),
   this.getLabelDate(3),
   this.getLabelDate(4),
   this.getLabelDate(5),
   this.getLabelDate(6),
   this.getLabelDate(7),
  ];
  constructor(

    public dataService: AdminDataServicesService,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    public dialogRef: MatDialogRef<TimesheetEmplyeesRateComponent>,
    private routers: Router,private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    
  }
  ngOnInit() {
    this.iterateEmpJob();
    this.logEmployeeShifts();

    if (!this.isAddJobExecuted) {
      // Check if there are no existing jobs
      if (!this.dataService.employeeInTimeSheet.employeeShifts || this.dataService.employeeInTimeSheet.employeeShifts.length === 0) {
        this.addJob();  // Call addJob() only if there are no existing jobs
        this.isAddJobExecuted = true;  // Set the flag to true
      }
    }
    // this.daysOfWeek.forEach(day => {
    //   this.hoursInput[day] = '';
    // });
    // this.daysOfWeek.forEach((day, index) => {
    //   this.empJob[day] = this.getLabelDate(index + 1);
    // });

    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };
    this.http.get<any[]>(`https://api.samotplatform.com/shifts`, { 'headers': options })
      .subscribe(data => {
        this.shifts = data;
      });

      
      // this.addJob();
  }
  calculateTotalHours(){
    
    this.dataService.employeeInTimeSheet.employeeShifts.forEach(shift => {
      let totalHours=0;

      if (shift.hasOwnProperty('mondayHours')) totalHours += Number(shift.mondayHours);
      if (shift.hasOwnProperty('tuesdayHours')) totalHours += Number(shift.tuesdayHours);
      if (shift.hasOwnProperty('wednesdayHours')) totalHours += Number(shift.wednesdayHours);
      if (shift.hasOwnProperty('thursdayHours')) totalHours += Number(shift.thursdayHours);
      if (shift.hasOwnProperty('fridayHours')) totalHours += Number(shift.fridayHours);
      if (shift.hasOwnProperty('saturdayHours')) totalHours += Number(shift.saturdayHours);
      if (shift.hasOwnProperty('sundayHours')) totalHours +=Number( shift.sundayHours);

      // if (shift.hasOwnProperty('totalhours'))  totalHours= Number(shift.totalhours)+Number(totalHours);
      
      shift.totalHours = totalHours;
      shift.totalPay =Number(shift.totalHours) * Number(shift.payRate);
      var totalPayForEmployeeShifts = 0;
    if(this.dataService.employeeInTimeSheet.employeeShifts!== undefined){
      totalPayForEmployeeShifts = this.dataService.employeeInTimeSheet.employeeShifts.reduce((totalPay, empShift) => {
        return totalPay + (empShift.totalPay || 0);
      }, 0);
    }
    this.dataService.employeeInTimeSheet.grossPay = (totalPayForEmployeeShifts||0) + (this.dataService.employeeInTimeSheet.expenses || 0) - (this.dataService.employeeInTimeSheet.deductions || 0);
  });
  this.dataService.calculateTotalGrossPay();
  }


  
  onShiftSelectChange(empJob: any) {
    // This function will be triggered when the shift selection changes
  }
  // changeInEmployee(){
  //   this.dataService.updateEmployeeInArray(this.dataService.employeeInTimeSheet);
  // }
  handleExpansionClick(event: Event): void {
    // Prevent the row from collapsing when clicking inside the expanded content
    event.stopPropagation();
  }
  getDayHours(shift: employeeShift, day: string): number {
    // Example: If day is 'monday', this will return shift.mondayhours
    return shift[day.toLowerCase() + 'hours'];
  }
  addJob() {
    if (!this.dataService.employeeInTimeSheet.employeeShifts) {
      this.dataService.employeeInTimeSheet.employeeShifts = [];
    }
    
    const newJob: employeeShift = {
      OrganizationId:this.dataService.organization,
      GroupId:this.dataService.selectedOrganizationUnit,
      timesheetId:0,
      employeeId: this.dataService.employeeInTimeSheet.employeeId,
       // set this to the appropriate default value
      shiftId:undefined,
      payrate: undefined, // set this to the appropriate default value if needed
      totalhours: undefined,
      totalpay: undefined,
      mondayhours: undefined,
      tuesdayhours: undefined,
      wednesdayhours: undefined,
      thursdayhours: undefined,
      fridayhours: undefined,
      saturdayhours: undefined,
      sundayhours: undefined,

    };
    if (this.data) {
      this.isEdit = this.data.isEdit;
      this.selectedRow = this.data[0];
      newJob.timesheetId = 0;

    }
   
    // Create a deep copy of the newJob object to ensure each row has a unique object
    const copiedJob = JSON.parse(JSON.stringify(newJob));
  
    this.dataService.employeeInTimeSheet.employeeShifts.push(copiedJob);
  }
  
  logEmployeeShifts() {
  }
  removeJob(index: number) {
    const removedShift = this.dataService.employeeInTimeSheet.employeeShifts[index];
    
    if (removedShift) {
      // Subtract the totalPay of the removed shift from grossPay
      this.dataService.employeeInTimeSheet.grossPay -= (removedShift.totalPay || 0);
  
      // Remove the shift from the array
      this.dataService.employeeInTimeSheet.employeeShifts.splice(index, 1);
      
      // Recalculate total hours
      this.calculateTotalHours();
      
      // Recalculate total gross pay
      this.dataService.calculateTotalGrossPay();
    }
  }
  onJobSelectChange(job: Job) {
    const selectedJob = this.jobs.find(job => job.title === job.title);
  
    if (selectedJob) {
      job.rate = selectedJob.rate;
    }
  }
  iterateEmpJob() {
    Object.keys(this.empJob).forEach(day => {
      this.finaldata = this.empJob;
      // Perform additional actions with the data if needed

    });
  }

  private getLabelDate(dayOffset: number): { day: string; date: string } {
    const targetDate = new Date(this.dataService.startOfWeek);
  

    targetDate.setDate(targetDate.getDate() + dayOffset - targetDate.getDay());
  
    const dayOfWeek = this.daysOfWeek[dayOffset - 1];
    const formattedDate = `${targetDate.getDate()} ${this.getMonthName(targetDate.getMonth())}`;
  
  
    return { day: dayOfWeek, date: formattedDate };
  }
  
  private getMonthName(monthIndex: number): string {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames[monthIndex];
  }
  isShiftSelected(shiftId: number, currentEmpShift: employeeShift): boolean {
    // Check if the shiftId is already selected for another day
    return this.dataService.employeeInTimeSheet.employeeShifts.some(empShift => empShift.shiftId === shiftId && empShift !== currentEmpShift);
  }
  
}
export interface Shift{
  shiftId:number;
  timesheetId:number;
  shiftName:string;
  shiftRate:number;
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
export interface Employee {
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
  timesheetId:number;
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