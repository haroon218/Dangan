import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DataService } from '../services/data.service';
import { catchError, throwError } from 'rxjs';
import { loadTranslations } from '@angular/localize';
import { EmployeeDataService } from '../services/employe-data.service';

@Component({
  selector: 'app-reject-time-sheet-reason',
  templateUrl: './reject-time-sheet-reason.component.html',
  styleUrls: ['./reject-time-sheet-reason.component.css']
})
export class RejectTimeSheetReasonComponent {
    reason:any={};
    loggedInUser:any={};
    organizationUnit:number;
    horizontalPosition: MatSnackBarHorizontalPosition = "right";
    verticalPosition: MatSnackBarVerticalPosition = "bottom";
    durationInSeconds = 3;
   loading=false;
    constructor(
      public dialogRef: MatDialogRef<RejectTimeSheetReasonComponent>,
      public dialog: MatDialog,
      private _liveAnnouncer: LiveAnnouncer,
      private changeDetectorRefs: ChangeDetectorRef,
      private http: HttpClient,private service:DataService,
      private _snackBar: MatSnackBar,
      public userDataService: EmployeeDataService,
      public Headercds: ChangeDetectorRef,@Optional() @Inject(MAT_DIALOG_DATA) public data:any,
    ) {
      this.reason.timesheetId=data.timesheetId;
      this.reason.organizationId = data.organizationId;
      this.organizationUnit=data.groupId;
      this.reason.status = 3;
      var options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      
     
      // this.loggedInUser=this.service.loggedInUser;  
      this.reason.userId =this.service.loggedInUser.user_id;
      var getApproverOrder = data.timesheetApprovers.find((y) => (y.user.userId == this.service.loggedInUser.user_id));
      this.reason.approverOrder = getApproverOrder.approverOrder; 
    
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
    submit(){
    if(!this.userDataService.selectedOrganizationUnit){
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.loading=true;
    this.http
      .put(
        `https://api.samotplatform.com/Organization/Timesheet/ApproverStatus`,
        this.reason,
        { headers: options }
      )
      .pipe(
        catchError((error) => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading=false;
           
          } else if (error.status >= 500) {
            this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading=false;
            
          } else {
            this.openSnackBar("An error occurred: " + error.status, false);
            this.loading=false;
         
          }
          return throwError(error);
        })
      )
      .subscribe((data) => {
        this.loading=false;
        // this.openSnackBar("TimeSheet Rejected!", false);
        this.dialogRef.close(data);
      });
    }else{
      this.reason.groupId = this.organizationUnit;
      var options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.loading=true;
      this.http
        .put(
          `https://api.samotplatform.com/Timesheet/ApproverStatus/`,
          this.reason,
          { headers: options }
        )
        .pipe(
          catchError((error) => {
            if (error.status >= 400 && error.status < 500) {
              this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading=false;
             
            } else if (error.status >= 500) {
              this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading=false;
              
            } else {
              this.openSnackBar("An error occurred: " + error.status, false);
              this.loading=false;
           
            }
            return throwError(error);
          })
        )
        .subscribe((data:any) => {
          this.loading=false;
          this.openSnackBar("TimeSheet Rejected!", false);
          this.dialogRef.close(data);
        });
    }
    }

  cancelDialog(){
    
  }
}
export interface loggedInUser {
  user_id : number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  status: string;
  user_roles:any[];

}