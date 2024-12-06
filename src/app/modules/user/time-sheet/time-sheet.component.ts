import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";  
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
//import { DataService } from 'app/modules/user/services/data.service';
import { catchError, forkJoin, throwError } from "rxjs";
import { BulkEmployeeComponent } from "../bulk-employee/bulk-employee.component";
import { EmployeeCreateComponent } from "../employee-create/employee-create.component";
import { DataService } from "app/modules/user/services/data.service";
import { TimeSheetDetailComponent } from "../time-sheet-detail/time-sheet-detail.component";
import { RejectTimeSheetReasonComponent } from "../reject-time-sheet-reason/reject-time-sheet-reason.component";
import { AdminDataServicesService } from "app/modules/admin/components/services/admin-data-services.service";
import { timeEnd } from "console";
import { EmployeeDataService } from "../services/employe-data.service";
import { Time } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
export interface TimeSheet {
  timesheetId: string;
  Detail: string;
  status: number;
  currentApproverOrder: number;
  timesheetApprovers: timesheetApprover[];
  timesheetEmployees: timesheetEmployee[];
  approverId: number;
  user: {};
  email: string;
  isCurrentApprover:boolean;
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
export interface timesheetEmployee {
  organizationId: number;
  groupId: number;
  grossPay:number;
  expenses:number;
  deductions:number;
  timeSheetId: number;
  employeeId: number;
  employee: employee;
}

export interface user {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}
export interface employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}
export interface Approvers {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  margin: number;

  idpId: number;
}
@Component({
  selector: '.app-component',
  templateUrl: "./time-sheet.component.html",
  styleUrls: ["./time-sheet.component.css"],
})
export class TimeSheetComponent {
 
  selectOrgUnit: number;
  organization:any;
  OrganizationId:any;

  selectedOption: string;
  statusApproverObject: any = {};
  loggedInUser: any = {};
  Organizations: Organization[] = [];
  OrganizationUnit: OrganizationUnit[] = [];
  employees: any[] = [];
  displayedColumns: string[] = ["id","Detail", "Type","Period","SubTotal","Status","Action"];
  dataSource = new MatTableDataSource<TimeSheet>(this.employees);
  selection = new SelectionModel<TimeSheet>(true, []);
  isToolbarOpen = false;
  isEdit = false;
  deleteRecordSave: any = [];
  viewTimeSheetArray :TimeSheet[]=[];
  snackBar: any;
  timesheetId: any;
  results: any = {};

  selectedRow: any = {};
  delId: any;
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  loading = false;
  sort: MatSort = new MatSort();
  checkApprove = false;
  doneIconIds: string[] = [];
  // isCurrentApprover = false;
  elements: any[] = [
    { status: "Pending For Client Approval", checkApprove: false }, // example row data
    // Add more rows as needed
  ];

  durationInSeconds = 3;
  constructor(
    public dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public dataservice: EmployeeDataService,
    public service:DataService,
    public Headercds: ChangeDetectorRef,
    private route:ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      this.OrganizationId= params['organizationId'];
      this.timesheetId = params['timesheetId'];
    });
    

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

 async ngOnInit() {
  
    await this.service.me();
    if(!this.service.organizationId){
      this.openSnackBar("User is not a part of any Organization " , false);
        
      }
    this.getOrgUnit();
    this.loading=true;  
    this.getTimeSheet().then(() => {
      this.loading = false;
    });
   
  }
 

  getOrgUnit() {
    this.loading = true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    if(this.service.organizationId!==undefined){
    this.http
      .get<OrganizationUnit[]>(
        `https://api.samotplatform.com/groups/organization/` +
          this.service.organizationId,
        { headers: options }
      )
      // .pipe(
      //   catchError((error) => {
      //     if (error.status >= 400 && error.status < 500) {
      //       this.openSnackBar("Client error occurred:  " + error.status, false);
      //       this.loading = false;
      //     } else if (error.status >= 500) {
      //       this.openSnackBar("Server error occurred: " + error.status, false);
      //       this.loading = false;
      //     } else {
      //       this.openSnackBar("An error occurred: " + error.status, false);
      //       this.loading = false;
      //     }
      //     return throwError(error);
      //   })
      // )
      .subscribe((data) => {
        this.OrganizationUnit=[];
        this.loading = false;
        data.forEach(element => {
          var find=this.loggedInUser.user_groups.find(x=>x == element.name);
          if(find){
           this.OrganizationUnit.push(element);
          }else{
          }  
        });
        if (this.OrganizationUnit.length > 0) {
          // this.dataservice.selectedOrganizationUnit = Number(this.OrganizationUnit[0].groupId);
        } else {
          this.dataservice.selectedOrganizationUnit = null; 
        }
      });
    }
  }

  async getTimeSheet(): Promise<void> {
    this.Organizations = this.service.organizationName;
    this.organization = this.Organizations;
  
    const options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
  
    try {
      let data: TimeSheet[] = [];
      if (!this.dataservice.selectedOrganizationUnit) {
        const response = await this.http.get<TimeSheet[]>(`https://api.samotplatform.com/organization/timesheets/` + this.service.organizationId, { headers: options }).toPromise();
        data = response;
        // console.log(response)
      } else {
        const response = await this.http.get<TimeSheet[]>(`https://api.samotplatform.com/Timesheets/organizationunit/` + this.dataservice.selectedOrganizationUnit, { headers: options }).toPromise();
        data = response;
      }
  
      this.processTimeSheetData(data);
  
    } catch (error) {
      // this.handleError(error);
    } finally {
    }
  }
  
  private processTimeSheetData(data: TimeSheet[]): void {
    data.forEach((timesheet) => {
      if (timesheet.timesheetApprovers.length > 1) {
        timesheet.timesheetApprovers.sort((a, b) => a.approverOrder - b.approverOrder);
      }
      if (timesheet.timesheetApprovers.length > 0 && timesheet.currentApproverOrder != null) {
        this.service.loggedInUser.user_roles.forEach((role) => {
          if (role == "Approver") {
            var currentApprover = timesheet.timesheetApprovers.find((x) => x.approverOrder == timesheet.currentApproverOrder);
            if (currentApprover != undefined) {
              this.isEdit = true;
              
              if (currentApprover.user.email === this.service.loggedInUser.email && currentApprover.status === 1 && timesheet.status === 1) {
                timesheet.isCurrentApprover = true;
              }
            }
          }
        });
      }
    });
    this.employees = data;
    this.dataSource= new MatTableDataSource<any>(this.employees);
    this.dataSource.paginator = this.paginator;
        if(this.timesheetId!==undefined && this.service.organizationId==this.OrganizationId){
         data.forEach(element => {
             if(element.timesheetId==this.timesheetId){
              this.viewTimeSheet(element);
             }
         });
         this.loading=false;  
        }else{  
          this.employees=data;
          this.dataSource = new MatTableDataSource<any>(this.employees);
          this.dataSource.paginator = this.paginator;

      }
   
  }
  // private handleError(error: any): void {
  //   if (error.status >= 400 && error.status < 500) {
  //     this.openSnackBar("Client error occurred: " + error.status, false);
  //   } else if (error.status >= 500) {
  //     this.openSnackBar("Server error occurred: " + error.status, false);
  //   } else {
  //     // this.openSnackBar("An error occurred: " + error.status, false);
  //   }
  // }
    getMonthName(monthNumber: number): string {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months[monthNumber - 1];
    }
    getStatusText(Status: number): string {
      switch (Status) {
        case 1:
          return "Pending";
        case 2:
          return "Pending For Admin Approval";
        case 3:
          return "DisApproved";
          case 4:
          return "Completed";
          case 5:
            return 'Admin DisApproved';
        default:
          return "Unknown";
      }
    }
  // statusApproved(element: any) {
    
  //   this.statusApproverObject.timesheetId = element.timesheetId;

  //   this.statusApproverObject.userId =
  //     this.loggedInUser.user_id;
  //   var getApproverOrder = element.timesheetApprovers.find(
  //     (y) => (y.userId = this.loggedInUser.user_id)
  //   );
  //   console.log(getApproverOrder);
  //   this.statusApproverObject.approverOrder = getApproverOrder.approverOrder;
  //   this.statusApproverObject.status = 2;
  //   this.statusApproverObject.organizationId = this.datservice.organization;
  //   this.statusApproverObject.groupId = this.datservice.selectedOrganizationUnit;
  //   this.statusApproverObject.statusReason = "";
  //   // this.statusApproverObject
  //   console.log(this.statusApproverObject);
  //   this.loading=true;
  //   var options = {
  //     Authorization: "Bearer " + localStorage.getItem("token"),
  //   };
  //   this.http
  //     .put(
  //       `https://api.samotplatform.com/Timesheet/ApproverStatus/`,
  //       this.statusApproverObject,
  //       { headers: options }
  //     )
  //     .pipe(
  //       catchError((error) => {
  //         if (error.status >= 400 && error.status < 500) {
  //           this.openSnackBar("Client error occurred:  " + error.status, false);
  //           this.loading = false;
  //         } else if (error.status >= 500) {
  //           this.openSnackBar("Server error occurred: " + error.status, false);
  //           this.loading = false;
  //         } else {
  //           this.openSnackBar("An error occurred: " + error.status, false);
  //           this.loading = false;
  //         }
  //         return throwError(error);
  //       })
  //     )
  //     .subscribe((data: any) => {
  //       console.log(data);
  //       this.loading=false;
  //       element.timesheetApprovers.find((x) => x.user.userId == data.userId).status = data.status;
  //         element.isCurrentApprover = false;
  //       console.log(element);
  //       this.openSnackBar("TimeSheet Approved Successfully!", true);
  //     });
  // }
  // statusRejected(element: any) {
  //   // element.checkApprove = false;

  //   const dialogRef = this.dialog.open(RejectTimeSheetReasonComponent, {
  //     width: "30%",
  //     height: "29%",
  //     data: element,
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log(result);
  //     element.timesheetApprovers.find((x) => x.user.userId == result.userId).status =result.status;
  //     element.isCurrentApprover = false;

  //       this.openSnackBar("TimeSheet Rejected!", true);

  //   });
  // }
  
  selections = new SelectionModel<TimeSheet>(true, []);
  handlePage(event: any) {}
  handleCheckboxChange(row: TimeSheet): void {
    this.changeDetectorRefs.detectChanges();
    this.selections.toggle(row);
    this.selectedRow =
      this.selections.selected.length > 0
        ? this.selections.selected
        : undefined;

    this.delId = this.selectedRow.id;
  }
  openToolbar() {
    // this.deleteRecordSave = this.selection.selected;
    // console.log(this.deleteRecordSave);
    if (this.selection.selected.length > 0) {
      (document.getElementById("toolBar") as HTMLLIElement).style.display =
        "block";
    } else {
      (document.getElementById("toolBar") as HTMLLIElement).style.display =
        "none";
    }

    if (this.selection.selected.length > 1) {
      (
        document.getElementById("tool-bar-edit") as HTMLLIElement
      ).style.display = "none";
    } else {
      (
        document.getElementById("tool-bar-edit") as HTMLLIElement
      ).style.display = "block";
    }
  }
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  checkboxLabel(row?: TimeSheet): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${
      this.selection.isSelected(row) ? "deselect" : "select"
    } row ${index}`;
  }

  updateTimesheet() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    dialogConfig.data.isEdit = true; // Set isEdit to true
  
    // dialogConfig.height = '660px';
    dialogConfig.width = '1800px';
    const dialogRef = this.dialog.open(TimeSheetDetailComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result:any) => {
      dialogConfig.data.isEdit = false; 
      if (result && result.emp) {
        const index = this.employees.findIndex(e => e.timesheetId == result.emp.timesheetId);
        if (index !== -1) {
          this.employees[index] = result.emp;
          this.dataSource.data = this.employees;
          this.selection.clear(); 
          this.selections.clear();
          this.openToolbar();
        }
      }
     
    });
  }
  viewTimeSheet(row:TimeSheet ) {
        this.viewTimeSheetArray.push(row);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = this.viewTimeSheetArray;
        this.viewTimeSheetArray=[];
        dialogConfig.data.isEdit = true; 
        dialogConfig.width = '1800px';
        const dialogRef = this.dialog.open(TimeSheetDetailComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result:any) => {
        dialogConfig.data.isEdit = false; 
        if (result && result.emp) {
        const index = this.employees.findIndex(e => e.timesheetId == result.emp.timesheetId);
        if (index !== -1) {
          this.employees[index] = result.emp;
          this.dataSource.data = this.employees;
          this.selection.clear(); 
          this.selections.clear();
          this.openToolbar();
        }
      }
     
    });
  }
}

export interface Organization {
  name: string;
  Name: string;
  OrganizationId: number;
}

export interface OrganizationUnit {
  name: string;
  id: string;
  groupId: string;
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
}