import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TimesheetDetailsComponent } from '../timesheet-details/timesheet-details.component';
export interface TimeSheet {
  timesheetId: string;
  Detail: string;
  status: number;
  currentApproverOrder: number;
  timesheetApprovers: timesheetApprover[];
  approverId: number;
  user: {};
  email: string;
  isCurrentAdmin:boolean;

}
export interface timesheetApprover {
  organizationId: number;
  groupId: number;
  timeSheetId: number;
  userId: number;
  approverOrder: number;
  user: user;
  status: number;
}
export interface user {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}
@Component({
  selector: 'app-auditlog-detail',
  templateUrl: './auditlog-detail.component.html',
  styleUrls: ['./auditlog-detail.component.css']
})
export class AuditlogDetailComponent {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }
  displayedColumns: string[] = ['position', 'weight','date','status'];
  loading=false;
  timeSheets:any =[];
  isEdit:boolean;
  timeSheet:any={};
  timesheetState=false;
  dataSource = new MatTableDataSource<any>(this.timeSheets);
  constructor(private _liveAnnouncer: LiveAnnouncer,public dataService: AdminDataServicesService,public dialog:MatDialog,private http: HttpClient,public Headercds:ChangeDetectorRef,public dialogRef: MatDialogRef<AuditlogDetailComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,)  {
      this.timeSheet=data;
      if(this.timeSheet!=undefined){
        this.getAuditLogs();
      }
      dialogRef.disableClose = true;


    }

    timesheetStateGet:any;
    getAuditLogs() {
      this.loading = true;
      var options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
      let apiUrl: string;
    
        if (!this.timeSheet.groupId) {
          apiUrl = `https://api.samotplatform.com/organization/Timesheet/${this.timeSheet.timesheetId}/auditLogs/`;
        } else {
          apiUrl = `https://api.samotplatform.com/Timesheets/${this.timeSheet.timesheetId}/auditLogs/`;
        }
      this.http.get<any[]>(apiUrl, {'headers': options})
        .subscribe(data => {
          this.loading = false;
          this.timeSheets = data;
          this.dataSource = new MatTableDataSource<any>(this.timeSheets);
          this.dataSource.paginator = this.paginator;
    
          this.timesheetStateGet = JSON.parse(data[0].timesheetState);
    
          this.timesheetState = this.dataSource.data.some(item => this.isTimesheetStateNull(item));
    
        });
    }
    
    isTimesheetStateNull(element: any): boolean {
      return element.timesheetState === null;
    }


   announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  viewTimeSheet(element){
    const dialogConfig = new MatDialogConfig();
  dialogConfig.data = element;
  dialogConfig.data.isEdit = true; // Set isEdit to true


  // dialogConfig.height = '660px';
  dialogConfig.width = '1800px';
  const dialogRef = this.dialog.open(TimesheetDetailsComponent, dialogConfig);
  // this.selection.clear(); // Clear the selection
  // this.openToolbar();
  dialogRef.afterClosed().subscribe(result => {
    dialogConfig.data.isEdit = false; 
    
   
  });
  
}
}
