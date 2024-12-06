import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmployeeDataService } from '../services/employe-data.service';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-save-change',
  templateUrl: './save-change.component.html',
  styleUrls: ['./save-change.component.css']
})
export class SaveChangeComponent {
  timesheet:any={};
  timesheets:any[]=[];

  loading=false;
  durationInSeconds = 3;
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  constructor(
    public dialogRef: MatDialogRef<SaveChangeComponent>,
    public dialog: MatDialog,
    public dataService: EmployeeDataService,
    public service:DataService,
    private _liveAnnouncer: LiveAnnouncer,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public Headercds: ChangeDetectorRef,@Optional() @Inject(MAT_DIALOG_DATA) public data:any,
  ){
    this.timesheet=data;
  }
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ["success-snackbar"] : ["error-snackbar"];

    this._snackBar.open(message, "✘", {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass,
    });
  }
  cancelDialog(){
    this.dialogRef.close();
  }
  calculateSubtotal(): number {
    return this.dataService.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.TaxablePay || 0);
    }, 0);
  }
  save(){
    
      this.timesheet.organizationId=this.service.organizationId;
      this.timesheet.type = this.dataService.selectedTimesheetType;
      this.timesheet.weekStartDate=this.dataService.startOfWeek;
      this.timesheet.weekEndDate=this.dataService.endOfWeek;
      
      if(!this.dataService.selectedOrganizationUnit){
        if( this.timesheet.type==1){
          this.timesheet.subtotal=this.dataService.displayedTotalGrossPay;
         this.timesheet.timesheetEmployees= this.dataService.employees.map(emp => {
            return {
              organizationId:this.timesheet.organizationId,
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
          this.timesheet.subtotal=this.calculateSubtotal();
      
          this.timesheet.timesheetEmployees= this.dataService.employees.map(emp => {
            return {
              organizationId: this.timesheet.organizationId,
              timesheetId : this.timesheet.timesheetId,
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
      this.loading=true;
      this.http.put(`https://api.samotplatform.com/Organization/Timesheets/` + this.timesheet.timesheetId, this.timesheet, { 'headers': options })
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
        
          this.dialogRef.close(data);
          this.openSnackBar("Timesheet updated Successfully",true);
    
        });
      }else{
      this.timesheet.GroupId = this.dataService.selectedOrganizationUnit;
      if( this.timesheet.type==1){
        this.timesheet.subtotal=this.dataService.displayedTotalGrossPay;

        this.timesheet.timesheetEmployees= this.dataService.employees.map(emp => {
          return {
            organizationId:this.timesheet.organizationId,
            groupId:this.timesheet.groupId,
            timesheetId : this.timesheet.timesheetId,
            employeeId: emp.employeeId, 
            employeeShifts: this.timesheet.timesheetEmployees.employeeShifts,
            expenses: emp.expenses,
            deductions: emp.deductions,
            grossPay: emp.grossPay
          };
        });
      }
      else if (this.timesheet.type == 2){
        this.timesheet.subtotal=this.calculateSubtotal();

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
        this.loading=true;
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
          
            this.dialogRef.close(data);
            this.openSnackBar("Timesheet updated Successfully",true);
      
          });
      }
    
  }
}
