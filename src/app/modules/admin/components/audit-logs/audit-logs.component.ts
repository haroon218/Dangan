import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdminDataServicesService } from '../services/admin-data-services.service';
import { AuditlogDetailComponent } from '../auditlog-detail/auditlog-detail.component';
import { Observable, catchError, map, startWith, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent {
  myControl = new FormControl('');  
  filteredOrganization: Observable<any>;
  organizationName: any;
  options: any=[];
  
  selectedOption: any;
  Organizations: Organization[] = [];
  OrganizationUnit: OrganizationUnit[] = [];
  displayedColumns: string[] = ["id","Type","Period","SubTotal","Status","view","download"];

  timeSheets:any =[];
  dataSource = new MatTableDataSource<TimeSheet>(this.timeSheets);
  selection = new SelectionModel<TimeSheet>(true, []);
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  payable:number;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds=2;
  baseUrl='https://api.samotplatform.com/'; 

  results:any={};
  isToolbarOpen = false;
  loading=false;
  selected='option1';
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  constructor(private router:Router,private _liveAnnouncer: LiveAnnouncer,public dataService: AdminDataServicesService,public dialog:MatDialog,private http: HttpClient,private _snackBar: MatSnackBar,public Headercds:ChangeDetectorRef)  {}
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
  ngOnInit(){
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate(['']);
      return;
    }
    this.loading=true;
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    }
    this.http.get<Organization[]>(`https://dgr.sso.id/myorganizations`, {'headers':options})
    .subscribe(data => {
      if (data.length === 0) {
        this.loading = false; 
        return;
      }
      var getOrganization = JSON.parse(localStorage.getItem('Organization'));
      if(getOrganization!==null){
       this.Organizations = data;
       this.organizationName=getOrganization.Name;
       this.dataService.organization =  getOrganization.OrganizationId;
       }else{
       this.Organizations = data;
       this.organizationName= this.Organizations[0].Name;
       this.dataService.organization = this.Organizations[0].OrganizationId;
       this.loading = false;
      }
      this.getOrgUnit();
    });
  }
  getOrgUnit() {
    this.Organizations.forEach(element => {
      if(element.Name==this.organizationName){
        this.dataService.organization=element.OrganizationId;
        localStorage.removeItem('Organization')
        localStorage.setItem('Organization',JSON.stringify(element));
      }
  });
  // this.loading=true;
  const options = {
    "Authorization": "Bearer " + localStorage.getItem('token')      
  };

  this.http.get<Organization[]>(`https://dgr.sso.id/myorganizations`, { 'headers': options })
    .pipe(
      catchError(error => {
        if (error.status >= 400 && error.status < 500) {
          this.openSnackBar('Client error occurred:  ' + error.status, false);
          this.loading = false;
        } else if (error.status >= 500) {
          this.openSnackBar('Server error occurred: ' + error.status, false);
          this.loading = false;
        } else {
          this.openSnackBar('An error occurred: ' + error.status, false);
          this.loading = false;
        }
        return throwError(error);
      })
    )
   .subscribe(data => {
    if (data.length === 0) {
      this.loading = false; // Stop loader if there is no data
      return;
    }
     this.options=[];
     this.options = data;
     this.filteredOrganization = this.myControl.valueChanges.pipe(
       startWith(''),
       map(value => this._filters(value || '')),
     );
    //  this.loading = false;
    this.getTimeSheet();
   
      });

  }
  private _filters(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.Name.toLowerCase().includes(filterValue));
  }
  
  getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  }
  clearInput(){
    this.organizationName='';
  }
  getTimeSheet():any{
    this.loading=true;
  
     var options = {
       "Authorization": "Bearer " + localStorage.getItem('token')
     }
     if (!this.dataService.selectedOrganizationUnit) {
     this.http.get<TimeSheet[]>(`https://api.samotplatform.com/organization/timesheets/`+this.dataService.organization, {'headers':options})
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
      // if (data.length === 0) {
      //   this.loading = false; // Stop loader if there is no data
      //   return;
      // }
      this.dataSource.data=[];
      this.timeSheets=[];
      this.loading=false;
       if(data!=null){
       data.forEach(element => {
        if(element.status == 4){
          this.timeSheets.push(element);
        }
       });
       this.dataSource = new MatTableDataSource<TimeSheet>(this.timeSheets);
       this.dataSource.paginator = this.paginator;
      }
     });
   }
   if(this.dataService.selectedOrganizationUnit!==undefined && this.dataService.selectedOrganizationUnit!==null){
   this.http.get<TimeSheet[]>(`https://api.samotplatform.com/Timesheets/organizationunit/`+this.dataService.selectedOrganizationUnit, {'headers':options})
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
      if (data.length === 0) {
        this.loading = false; // Stop loader if there is no data
        return;
      }
      this.dataSource.data=[];
      this.timeSheets=[];
      this.loading=false;
       if(data!=null){
       data.forEach(element => {
        if(element.status == 4){
          this.timeSheets.push(element);
        }
       });
       this.dataSource = new MatTableDataSource<TimeSheet>(this.timeSheets);
       this.dataSource.paginator = this.paginator;
      }
     });
    }
  }
  getStatusText(Status: number): string {
  
    switch (Status) {
     
      case 1:
        return 'Pending For Client Approval';
      case 2:
        return 'Pending';
      case 3:
        return 'Client DisApproved';
      case 4:
        return 'Completed';
        case 5:
          return 'DisApproved';
      default:
        return 'Unknown';
    }
  }
 
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = ((this.dataSource.data.length)  );
    return numSelected === numRows;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }
  
  openToolbar() {
    if (this.selection.selected.length > 0 ) {
      (document.getElementById("toolBar") as HTMLLIElement).style.display = 'block';
    } else {
      (document.getElementById("toolBar") as HTMLLIElement).style.display = 'none';
    }

    if (this.selection.selected.length > 1 ) {
      (document.getElementById("tool-bar-edit") as HTMLLIElement).style.display = 'none';
    } else {
      (document.getElementById("tool-bar-edit") as HTMLLIElement).style.display = 'block';
    } 
  }

  downloadReport(id:number){
    if(!this.dataService.selectedOrganizationUnit){
   window.open("https://api.samotplatform.com/Organization/timesheets/"+id+"/auditreport","_blank");
  }else{
    window.open("https://api.samotplatform.com/timesheets/"+id+"/auditreport","_blank");

  }
 
}
 
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TimeSheet): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${
      this.selection.isSelected(row) ? "deselect" : "select"
    } row ${index}`;
  }
  openForm(element){

    const dialogRef = this.dialog.open(AuditlogDetailComponent, {
      width: '883px',
      height:'600px',
      data:element
     });
  }
  

  @ViewChild(MatSort)
  sort: MatSort = new MatSort;

  
  
  

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
 
 
  delLogs(){
    // var options = {
    //   "Authorization": "Bearer " + localStorage.getItem('token')
      
    // }
    // this.http.patch(`https://api.samotplatform.com/payRequestStatus/`+this.request.id,this.request,{'headers':options})
    // .subscribe(data => {
    //   this.openSnackBar("PayRequest Accept Successfully!");
    //    this.dialogRef.close({emp:data});
    //   this.cdr.detectChanges();
    // });
  }

  selectedRow:any = {};
  selections = new SelectionModel<String>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: String): void {
    // const dialogRef = this.dialog.open(PayRequestDetailComponent);

    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
    
    // this.delId = this.selectedRow.id;
  }
  viewLog(element: any) {
    const dialogRef = this.dialog.open(AuditlogDetailComponent, {
      data: { element },
      width:'500px',
      height:'500px'
    });
  }
 
}
export interface PeriodicElement {
  // name: string;
  position: number;
  icon:string;
  symbol:string;
  select:string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  
];
export interface Organization {
  name: string;
  Name: string; 
  id: string;
  OrganizationId: number;
}
export interface OrganizationUnit{
  name: string;
  id: string;
  groupId: number;
}