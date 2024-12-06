import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, Inject, Optional, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../services/data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-audit-logdetail',
  templateUrl: './audit-logdetail.component.html',
  styleUrls: ['./audit-logdetail.component.css']
})
export class AuditLogdetailComponent {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }
  displayedColumns: string[] = ['position', 'weight','date','status'];
  loading=false;
  timeSheets:any =[];
  timeSheet:any={};
  dataSource = new MatTableDataSource<any>(this.timeSheets);
  constructor(private _liveAnnouncer: LiveAnnouncer,public dataService: DataService,public dialog:MatDialog,private http: HttpClient,public Headercds:ChangeDetectorRef,public dialogRef: MatDialogRef<AuditLogdetailComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,)  {
      this.timeSheet=data;
      if(this.timeSheet!=undefined){
        // this.getAuditLogs();
      }
   
    }


    // getAuditLogs() {
    //   this.loading = true;
    //   const options = {
    //     Authorization: 'Bearer ' + localStorage.getItem('token')
    //   };
    
    //   let apiUrl: string;
    
    //   if (!this.timeSheet.groupId) {
    //     apiUrl = `https://api.samotplatform.com/organization/Timesheet/${this.timeSheet.timesheetId}/auditLogs/`;
    //   } else {
    //     apiUrl = `https://api.samotplatform.com/Timesheets/${this.timeSheet.timesheetId}/auditLogs/`;
    //   }
    
    //   this.http.get<any[]>(apiUrl, { headers: options })
    //     .subscribe(data => {
    //       console.log(data);
    //       this.loading = false;
    //       this.timeSheets = data;
    //       this.dataSource = new MatTableDataSource<any>(this.timeSheets);
    //       this.dataSource.paginator = this.paginator;
    //       console.log(this.dataSource.data);
    //     });
    // }
    


   /** Announce the change in sort state for assistive technology. */
   announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}

