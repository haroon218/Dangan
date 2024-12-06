import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuditlogDetailComponent } from 'app/modules/admin/components/auditlog-detail/auditlog-detail.component';
import { MatSort, Sort } from '@angular/material/sort';
import { catchError, throwError } from 'rxjs';
import { url } from 'inspector';
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
  public organization:any;
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
  
  constructor(private _liveAnnouncer: LiveAnnouncer,public dataService:DataService ,private _snackBar: MatSnackBar,public dialog:MatDialog,private http: HttpClient,public Headercds:ChangeDetectorRef)  {}
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }
 async ngOnInit(){
    await this.dataService.me();
    if(!this.dataService.organizationId){
      this.openSnackBar("User is not a part of any Organization " , false);
        
      }
    this.loading=true;
    this.getTimeSheet().then(() => {
      this.loading = false;
    });
    this.getOrgUnit();
  }
  getOrgUnit() {
    var options = {
      "Authorization": "Bearer " + localStorage.getItem('token')
    };
  
    this.http.get<OrganizationUnit[]>(this.baseUrl + `groups/organization/` + this.dataService.organizationId, { 'headers': options })
      .subscribe(data => {
        this.OrganizationUnit=[];
        this.http.get<loggedInUser>(`https://dgr.sso.id/oauth2/me`, {'headers': options})
        .subscribe(login => {
        data.forEach(element => {
          var find=login.user_groups.find(x=>x == element.name);
          if(find){
           this.OrganizationUnit.push(element);
           this.getTimeSheet();

          }else{
          }  
        });
        // this.loading = false;
        // this.getTimeSheet();
        // this.OrganizationUnit = data;
  
        if (this.OrganizationUnit.length > 0) {
          // this.dataService.selectedOrganizationUnit = Number(this.OrganizationUnit[0].groupId);
        } else {
          this.dataService.selectedOrganizationUnit = null; 
         this.getTimeSheet();
        }
        
      });
        
      });
  }
  async getTimeSheet(): Promise<void> {
    try {
      this.Organizations = this.dataService.organizationName;
      this.organization = this.Organizations;
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
  
      if (!this.dataService.selectedOrganizationUnit) {
        const data1 = await this.http.get<TimeSheet[]>(`https://api.samotplatform.com/organization/timesheets/` + this.dataService.organizationId, { 'headers': options }).toPromise();
        console.log(data1);
        if (data1 != null) {
          this.dataSource.data = [];
          this.timeSheets = [];
          data1.forEach(element => {
            if (element.status == 4) {
              this.timeSheets.push(element);
            }
          });
          this.dataSource = new MatTableDataSource<TimeSheet>(this.timeSheets);
          this.dataSource.paginator = this.paginator;
        }
      }
  
      const data2 = await this.http.get<TimeSheet[]>(`https://api.samotplatform.com/Timesheets/organizationunit/` + this.dataService.selectedOrganizationUnit, { 'headers': options }).toPromise();
      console.log(data2);
      if (data2.length === 0) {
        this.loading = false;
        return;
      }
      this.dataSource.data = [];
      this.timeSheets = [];
      data2.forEach(element => {
        if (element.status == 4) {
          this.timeSheets.push(element);
        }
      });
      this.dataSource = new MatTableDataSource<TimeSheet>(this.timeSheets);
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      this.loading = false;
      console.error('Error fetching time sheets:', error);
    }
  }
  
  getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  }
  getStatusColorClass(status: number): string {
    switch (status) {
      case 1:
        return ''; // No additional class for 'Pending'
      case 2:
        return 'approved'; // Apply 'approved' class for 'Approved'
      case 3:
        return 'rejected'; // Apply 'rejected' class for 'Rejected'
      default:
        return 'unknown'; // Apply 'unknown' class for other statuses
    }
  }
  downloadReport(id:number){
      if(!this.dataService.selectedOrganizationUnit){
     window.open("https://api.samotplatform.com/Organization/timesheets/"+id+"/auditreport","_blank");
    }else{
      window.open("https://api.samotplatform.com/timesheets/"+id+"/auditreport","_blank");

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
      width: '880px',
      // height:'600px',
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
  selectedRow:any = {};
  selections = new SelectionModel<String>(true,[]);
  handlePage(event: any) {
  }
  handleCheckboxChange( row: String): void {
    // const dialogRef = this.dialog.open(PayRequestDetailComponent);

    this.selections.toggle(row);
    this.selectedRow = this.selections.selected.length > 0 ? this.selections.selected[0] : undefined;
    
    // this.delId = this.selectedRow.id;
    // console.log('Selected:', this.delId);
  }
  // viewLog(element: any) {
  //   console.log('Clicked on View button for element:', element);
  //   const dialogRef = this.dialog.open(AuditlogDetailComponent, {
  //     data: { element },
  //     width:'500px',
  //     height:'500px'
  //   });
  // }
 
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
export interface loggedInUser {
  user_id : number;
  firstName:string;
  lastName:string;
  email: string;
  margin:number;
  status: string;
  user_roles:any[];
  user_groups:any[];
  user_organizations:any[];
}