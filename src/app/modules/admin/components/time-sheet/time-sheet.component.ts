import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
//import { DataService } from 'app/modules/user/services/data.service';
import {
  Observable,
  catchError,
  forkJoin,
  lastValueFrom,
  map,
  startWith,
  throwError,
} from "rxjs";
import { BulkEmployeeComponent } from "../bulk-employee/bulk-employee.component";
import { EmployeeCreateComponent } from "../employee-create/employee-create.component";
// import { DataService } from 'app/modules/user/services/data.service';
import { TimeSheetFormComponent } from "../time-sheet-form/time-sheet-form.component";
import {
  AdminDataServicesService,
  Employee,
} from "../services/admin-data-services.service";

import { debug } from "console";
import { Time } from "@angular/common";
import { element } from "protractor";
import { BulkTimesheetComponent } from "../bulk-timesheet/bulk-timesheet.component";
import { ActivatedRoute, Router } from "@angular/router";
import { json } from "stream/consumers";
import { FormControl } from "@angular/forms";

export interface TimeSheet {
  timesheetId: string;
  Detail: string;
  status: number;
  currentApproverOrder: number;
  timesheetApprovers: timesheetApprover[];
  approverId: number;
  user: {};
  email: string;
  isCurrentAdmin: boolean;
  edit: boolean;
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
  selector: "app-time-sheet",
  templateUrl: "./time-sheet.component.html",
  styleUrls: ["./time-sheet.component.css"],
})
export class TimeSheetComponent {
  myControl = new FormControl("");
  filteredOrganization: Observable<any>;
  showCreateDiv: boolean = true;
  organization: number;
  totalGrossPay: number = 0;
  organizationName: any;
  paramOrganizationId: any;
  paramtimesheetId: any;
  timesheetEmployees: any = [];
  timesheetEmployee: any;
  timesheetId: any;
  options: any = [];
  ArrayOfelement: any = [];
  status: number;
  countemployee: any;
  isEdit: boolean = false;
  timesheet: any = {};
  loggedInAdmin: any = {};
  Organizations: Organization[] = [];
  OrganizationUnit: OrganizationUnit[] = [];
  employees: any = [];
  employeess: any = [];
  displayedColumns: string[] = [
    "select",
    "id",
    "Detail",
    "Type",
    "Period",
    "SubTotal",
    "Status",
    "Action",
  ];
  selectedStatus: string = ""; // Variable to hold the selected status
  statusOptions: string[] = ["All", "Pending", "Approved", "Rejected"];

  dataSource = new MatTableDataSource<TimeSheet>(this.employees);
  selectedOption: string;
  selection = new SelectionModel<TimeSheet>(true, []);
  isToolbarOpen = false;
  deleteRecordSave: any = [];
  statusApproverObject: any = {};
  snackBar: any;
  delId: any;
  employeeShift: any;
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort = new MatSort();
  loading = false;
  baseUrl = "https://api.samotplatform.com/";
  durationInSeconds = 3;
  constructor(
    private router: Router,
    public dataService: AdminDataServicesService,
    public dialog: MatDialog,
    private liveAnnouncer: LiveAnnouncer,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public Headercds: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramOrganizationId = params["organizationId"];
      this.paramtimesheetId = params["timesheetId"];
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
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if token is missing
      this.router.navigate([""]);
      return;
    }
    try {
      this.loading = true;
      const options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };

      const loggedInAdminPromise = this.http.get<loggedInAdmin>(
        "https://dgr.sso.id/oauth2/me",
        { headers: options }
      );
      const organizationsPromise = this.http.get<Organization[]>(
        "https://dgr.sso.id/myorganizations",
        { headers: options }
      );

      this.loggedInAdmin = await lastValueFrom(loggedInAdminPromise);
      const data = await lastValueFrom(organizationsPromise);

      if (data.length === 0) {
        this.loading = false; // Stop loader if there is no data
        return;
      }
      // this.route.params.subscribe(params => {
      //   this.dataService.organization = params['OrganizationId'];
      //    this.timesheetId = params['timesheetId'];
      //   // Use organizationId and timesheetId as needed in your component
      // });
      // this.Organizations=data;
      // data.forEach(element => {
      //  if (element.OrganizationId==this.dataService.organization){
      //       this.organizationName=element.Name;
      //  }
      // });
      // if(this.dataService.organization==null || this.dataService.organization==undefined){
      var getOrganization = JSON.parse(localStorage.getItem("Organization"));
      if (getOrganization !== null) {
        this.Organizations = data;
        this.organizationName = getOrganization.Name;
        this.dataService.organization = getOrganization.OrganizationId;
        this.getEmployees();
      } else {
        this.Organizations = data;
        this.organizationName = this.Organizations[0].Name;
        this.dataService.organization = this.Organizations[0].OrganizationId;
        this.loading = false;
      }
      // }
      this.Organizations.forEach((element) => {
        if (element.Name == this.organizationName) {
          this.dataService.organization = element.OrganizationId;
          localStorage.setItem("Organization", JSON.stringify(element));
        }
      });

      const params = this.route.snapshot.queryParams;
      const status = params["status"];

      if (status) {
        this.dataService.organization = undefined;
        this.organizationName = null;
        this.getTimeSheet();
      } else {
        this.selectedStatus = "All";
        this.dataSource.data = this.employees;
      }

      this.getOrgUnit();
    } catch (error) {
      this.loading = false;
    }
  }

  onSelectionChange() {
    this.Organizations.forEach((element) => {
      if (element.Name == this.organizationName) {
        this.dataService.organization = element.OrganizationId;
        localStorage.removeItem("Organization");
        localStorage.setItem("Organization", JSON.stringify(element));
      }
    });
    // this.loading=true;
    const options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    this.http
      .get<Organization[]>(`https://dgr.sso.id/myorganizations`, {
        headers: options,
      })
      .pipe(
        catchError((error) => {
          if (error.status >= 400 && error.status < 500) {
            this.openSnackBar("Client error occurred:  " + error.status, false);
            this.loading = false;
          } else if (error.status >= 500) {
            this.openSnackBar("Server error occurred: " + error.status, false);
            this.loading = false;
          } else {
            this.openSnackBar("An error occurred: " + error.status, false);
            this.loading = false;
          }
          return throwError(error);
        })
      )
      .subscribe((data) => {
        if (data.length === 0) {
          this.loading = false; // Stop loader if there is no data
          return;
        }
        this.options = [];
        this.options = data;
        this.filteredOrganization = this.myControl.valueChanges.pipe(
          startWith(""),
          map((value) => this._filters(value || ""))
        );
        //  this.loading = false;
      });
    this.getOrgUnit();
    // this.getTimeSheet();
    this.filterTimeSheetsByOption();
  }
  private _filters(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.Name.toLowerCase().includes(filterValue)
    );
  }

  clearInput() {
    this.organizationName = "";
  }
  handleCheckboxChange(row: TimeSheet): void {
    this.selections.toggle(row);
    this.selectedRow =
      this.selections.selected.length > 0
        ? this.selections.selected
        : undefined;
    this.showCreateDiv = this.selections.selected.length === 0;
  }
  openToolbar() {
    // this.deleteRecordSave = this.selection.selected;
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

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selections.clear();
      this.showCreateDiv = this.isAllSelected.length === 0;

      return;
    }
    this.dataSource.data.forEach((row) => this.selection.select(row));
    this.showCreateDiv = this.selection.selected.length === 0;
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
  filterTimesheetsByStatus(status: number) {
    switch (status) {
      case 1:
        this.selectedStatus = "Pending";
        break;
      case 4:
        this.selectedStatus = "Approved";
        break;
      case 5:
        this.selectedStatus = "Rejected";
        break;
      default:
        this.selectedStatus = "All";
    }

    if (this.selectedStatus === "All") {
      this.dataSource.data = this.employees;
    } else {
      this.dataSource.data = this.employees.filter(
        (timesheet) => timesheet.status === status
      );
    }
  }
  filterTimeSheetsByOption() {
    this.loading = false;
    if (this.selectedStatus === "All") {
      this.dataSource.data = this.employees; // Show all timesheets
    } else if (this.selectedStatus === "Pending") {
      this.dataSource.data = this.employees.filter(
        (timesheet) => timesheet.status === 1
      ); // Show pending timesheets
    } else if (this.selectedStatus === "Approved") {
      this.dataSource.data = this.employees.filter(
        (timesheet) => timesheet.status === 4
      ); // Show approved timesheets
    } else if (this.selectedStatus === "Rejected") {
      this.dataSource.data = this.employees.filter(
        (timesheet) => timesheet.status === 5
      ); // Show rejected timesheets
    }
  }

  getOrgUnit() {
    // this.loading = true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    this.http
      .get<OrganizationUnit[]>(
        this.baseUrl + `groups/organization/` + this.dataService.organization,
        { headers: options }
      )
      .subscribe((data) => {
        // if (data.length === 0) {
        //   this.loading = false; // Stop loader if there is no data

        // }
        this.OrganizationUnit = data;

        if (this.OrganizationUnit.length > 0) {
          //  this.dataService.selectedOrganizationUnit = (this.OrganizationUnit[0].groupId);
        } else {
          this.dataService.selectedOrganizationUnit = null;
        }

        this.getTimeSheet();
      });
  }
  getMonthName(monthNumber: number): string {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  }
  getEmployees(): any {
    this.loading = true;

    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    let apiEndpoint: string;

    // Check if organization unit is defined

    if (this.dataService.selectedOrganizationUnit) {
      // If organization unit is defined, fetch employees based on the organization unit
      apiEndpoint =
        `https://api.samotplatform.com/groups/employees/` +
        this.dataService.selectedOrganizationUnit;
    } else {
      // If organization unit is not defined, fetch employees based on the organization
      apiEndpoint =
        `https://api.samotplatform.com/organizationemployees/` +
        this.dataService.organization;
    }

    this.http
      .get<any[]>(apiEndpoint, { headers: options })
      .subscribe((data) => {
        this.employeess = data;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      });
  }
  getTimeSheet(): any {
    this.loading = true;
    const options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    if (!this.dataService.organization) {
      this.loading = true;
      const options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };

      const organizationUrl = `https://api.samotplatform.com/organization/timesheets`;
      const timesheetsUrl = `https://api.samotplatform.com/Timesheets`;

      forkJoin([
        this.http.get<TimeSheet[]>(organizationUrl, { headers: options }),
        this.http.get<TimeSheet[]>(timesheetsUrl, { headers: options }),
      ]).subscribe(
        ([organizationData, timesheetsData]) => {
          // Process organization timesheets data
          organizationData.forEach((timesheet) => {
            if (timesheet.timesheetApprovers.length > 1) {
              timesheet.timesheetApprovers.sort(
                (a, b) => a.approverOrder - b.approverOrder
              );
            }
            if (timesheet.currentApproverOrder != null) {
              this.loggedInAdmin.user_roles.forEach((role) => {
                if (role == "Admin") {
                  if (timesheet.status === 2) {
                    timesheet.isCurrentAdmin = true;
                  }
                }
              });
            }
          });

          // Process timesheets data
          timesheetsData.forEach((timesheet) => {
            if (timesheet.timesheetApprovers.length > 1) {
              timesheet.timesheetApprovers.sort(
                (a, b) => a.approverOrder - b.approverOrder
              );
            }
            if (timesheet.currentApproverOrder != null) {
              this.loggedInAdmin.user_roles.forEach((role) => {
                if (role == "Admin" && timesheet.status === 2) {
                  timesheet.isCurrentAdmin = true;
                }
              });
            }
          });

          this.employees = organizationData.concat(timesheetsData);
          this.dataSource = new MatTableDataSource<TimeSheet>(this.employees);
          this.dataSource.paginator = this.paginator;

          this.route.queryParams.subscribe((params) => {
            const status = params["status"];
            if (status) {
              this.filterTimesheetsByStatus(+status);
            } else {
              this.dataSource.data = this.employees;
            }
          });
          this.filterTimeSheetsByOption();
          this.loading = false;
        },
        (error) => {
          this.loading = false;
        }
      );

      return;
    }

    if (!this.dataService.selectedOrganizationUnit) {
      this.http
        .get<TimeSheet[]>(
          `https://api.samotplatform.com/organization/timesheets/` +
            this.dataService.organization,
          { headers: options }
        )
        .subscribe((data) => {
          // if (data.length === 0) {
          //   this.loading = false; // Stop loader if there is no data
          //   return;
          // }
          data.forEach((timesheet) => {
            if (timesheet.timesheetApprovers.length > 1) {
              timesheet.timesheetApprovers.sort(
                (a, b) => a.approverOrder - b.approverOrder
              );
            }
            if (timesheet.currentApproverOrder != null) {
              this.loggedInAdmin.user_roles.forEach((role) => {
                if (role == "Admin") {
                  if (timesheet.status === 2) {
                    timesheet.isCurrentAdmin = true;
                  }
                }
              });
            }
          });

          this.employees = data;
          this.dataSource = new MatTableDataSource<TimeSheet>(this.employees);
          this.dataSource.paginator = this.paginator;
          this.filterTimeSheetsByOption();

          if (
            this.paramtimesheetId !== undefined &&
            this.dataService.organization == this.paramOrganizationId
          ) {
            data.forEach((element) => {
              if (element.timesheetId == this.paramtimesheetId) {
                this.ArrayOfelement.push(element);
                this.selectedRow = this.ArrayOfelement;
                this.editTimeSheet();
              }
            });
            this.loading = false;
          } else {
            this.loading = false;
          }
        });

      return;
    }

    this.http
      .get<TimeSheet[]>(
        `https://api.samotplatform.com/Timesheets/organizationunit/` +
          this.dataService.selectedOrganizationUnit,
        { headers: options }
      )
      .subscribe((data) => {
        // if (data.length === 0) {
        //   this.loading = false; // Stop loader if there is no data
        //   return;
        // }
        data.forEach((timesheet) => {
          if (timesheet.timesheetApprovers.length > 1) {
            timesheet.timesheetApprovers.sort(
              (a, b) => a.approverOrder - b.approverOrder
            );
          }
          if (timesheet.currentApproverOrder != null) {
            this.loggedInAdmin.user_roles.forEach((role) => {
              if (role == "Admin") {
                if (timesheet.status === 2) {
                  timesheet.isCurrentAdmin = true;
                }
              }
            });
          }
        });

        this.employees = data;
        this.dataSource = new MatTableDataSource<TimeSheet>(this.employees);
        this.dataSource.paginator = this.paginator;
        this.filterTimeSheetsByOption();
        if (
          this.paramtimesheetId !== undefined &&
          this.dataService.organization == this.paramOrganizationId
        ) {
          data.forEach((element) => {
            if (element.timesheetId == this.paramtimesheetId) {
              this.ArrayOfelement.push(element);
              this.selectedRow = this.ArrayOfelement;
              this.editTimeSheet();
            }
          });
          this.loading = false;
        } else {
          this.loading = false;
        }
      });
  }

  getStatusText(Status: number): string {
    switch (Status) {
      case 1:
        return "Pending For Client Approval";
      case 2:
        return "Pending";
      case 3:
        return "Client DisApproved";
      case 4:
        return "Approved";
      case 5:
        return "Rejected";
      default:
        return "Unknown";
    }
  }
  getApproversStatusTooltip(approvers: any[]): string {
    return approvers
      .map((approver) => {
        if (approver.statusReason !== "") {
          return `Rejected By:  ${approver.user.firstName} ${approver.user.lastName} Reason:  ${approver.statusReason}`;
        } else {
          return;
        }
      })
      .join("  ");
  }
  results: any = {};
  selectOrgUnit: any;
  selectedRow: any = {};
  ArrayOf: any = [];

  selections = new SelectionModel<TimeSheet>(true, []);
  handlePage(event: any) {}

  openForm() {
    const dialogRef = this.dialog.open(TimeSheetFormComponent, {
      // data: this.dataService.organization,
      width: "1800px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined) {
        this.results = result;
        this.results.timesheetApprovers.sort(
          (a, b) => a.approverOrder - b.approverOrder
        );
        this.dataSource.data.push(this.results);
        this.dataSource = new MatTableDataSource<TimeSheet>(this.employees);
      } else {
        this.selection.clear();
        this.selections.clear();
        this.showCreateDiv = this.selections.selected.length === 0;

        this.openToolbar();
      }
    });
  }

  editTimeSheet() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedRow;
    dialogConfig.data.isEdit = true; // Set isEdit to true

    dialogConfig.width = "1800px";
    const dialogRef = this.dialog.open(TimeSheetFormComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      dialogConfig.data.isEdit = false;
      if (result != undefined) {
        if (result.status == 2) {
          result.isCurrentAdmin = true;
        }
        const index = this.employees.findIndex(
          (e) => e.timesheetId === result.timesheetId
        );
        if (index !== -1) {
          this.employees[index] = result; // Update the existing employee in the local array
          this.dataSource.data = this.employees;
          this.selection.clear(); // Update the MatTableDataSource
          this.selections.clear();
          this.showCreateDiv = this.selections.selected.length === 0;

          // Clear the selection
          this.openToolbar();
        }
      } else {
        this.selection.clear();

        this.selections.clear();
        this.showCreateDiv = this.selections.selected.length === 0;

        this.openToolbar();
      }
    });
  }

  delTimeSheet(): void {
    if (this.selection.selected.length > 0) {
      const options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.loading = true;
      const deleteRequests = this.selection.selected.map((timesheet) => {
        let deleteUrl: string;

        if (!this.dataService.selectedOrganizationUnit) {
          // If groupId is not available, use organization/timesheet
          deleteUrl = `https://api.samotplatform.com/Organization/Timesheet/${timesheet.timesheetId}`;
        } else {
          deleteUrl = `https://api.samotplatform.com/Timesheets/${timesheet.timesheetId}`;
        }

        return this.http.delete(deleteUrl, { headers: options });
      });

      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.employees = this.dataSource.data.filter(
            (timesheet) => !this.selection.selected.includes(timesheet)
          );
          this.loading = false;
          this.dataSource.data = this.employees;

          // Display a success message
          const totalDeletedTimeSheets = deleteRequests.length;
          const successMessage = `${totalDeletedTimeSheets} Timesheet${
            totalDeletedTimeSheets > 1 ? "s" : ""
          } Deleted Successfully`;
          this.openSnackBar(successMessage, true);

          // Clear selections
          this.selections.clear();
          this.selection.clear();
          this.showCreateDiv = this.selections.selected.length === 0;
          // Update the toolbar
          this.openToolbar();
        },
        error: (error: HttpErrorResponse) => {
          this.openSnackBar("Error deleting Timesheet", false);
        },
      });
    } else {
      this.openSnackBar("Select at least one timesheet to delete", false);
    }
  }
  AddBulk() {
    const dialogRef = this.dialog.open(BulkTimesheetComponent, {
      width: "400px",
      height: "250px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.length === 0) {
        this.openSnackBar("No data found in file", false);
        return;
      }
      this.timesheet={};
      const payrollcycleValue = result[0].payrollcycle.toLowerCase();
      this.timesheet.payrollcycle=null;
      const type = result[0].type.toLowerCase();
      switch (type) {
        case "hourly":
          this.timesheet.type = 1;
          break;
        case "fixed":
          this.timesheet.type = 2;
          break;
        default:
          this.openSnackBar("Timesheet should be Hourly or Fixed", false);
          return;
      }
      if (this.timesheet.type === 1) {
        this.timesheet.payrollcycle = 0;
      }
      switch (payrollcycleValue) {
        case "weekly":
          this.timesheet.payrollcycle = 1;
          break;
        case "bi-weekly":
          this.timesheet.payrollcycle = 2;
          break;
        case "monthly":
          this.timesheet.payrollcycle = 3;
          break;
        default:
          this.timesheet.payrollcycle = 0;
          break;
      }

      if ( 
        this.timesheet.payrollcycle == 0 ||
        this.timesheet.payrollcycle == 1 ||
        this.timesheet.payrollcycle == 2
      ) {
        this.timesheet.weekStartDate = ExcelDateToJSDate(
          result[0].weekStartDate
        );
        this.timesheet.weekEndDate = ExcelDateToJSDate(
          result[0].weekEndDate);
      }else if(this.timesheet.payrollcycle==3){
        this.timesheet.year = result[0].year.toString();
        this.timesheet.monthNumber = result[0].month.toString();
      }

      function ExcelDateToJSDate(serialnumber) {
        var utc_days = Math.floor(serialnumber - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);

        var fractional_day =
          serialnumber - Math.floor(serialnumber) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        return new Date(
          date_info.getFullYear(),
          date_info.getMonth(),
          date_info.getDate(),
          hours,
          minutes,
          seconds
        );
      }

      this.timesheetEmployees = [];
      let countTimeSheet = result.length;

      const emailToEmployeeIdMap = Number;

     
      this.timesheet.organizationId = this.dataService.organization;

      let invalidEmailCount = 0; // Counter for invalid emails

      this.timesheet.timesheetEmployees = this.timesheetEmployees;
      this.totalGrossPay=0;
      this.timesheet.subTotal=0;
      this.employeess.forEach((employee) => {
        emailToEmployeeIdMap[employee.email] = {
          employeeId: employee.employeeId,
          annualSalary: calculateGrossPay(employee.annualSalary,this.timesheet),
        };
      });
      result.forEach((resultItem) => {
        const employeeId = emailToEmployeeIdMap[resultItem.email];
        if (!employeeId) {
          invalidEmailCount++;
          this.openSnackBar(
            invalidEmailCount + " employees are not part of this organization",
            false
          );
          return;
        }
        this.timesheet.groupId = null;

        preprocessResultItem(resultItem);
        if(this.timesheet.type ===1){
          this.employeeShift = {
            employeeId: employeeId.employeeId,
            fridayHours: resultItem.fridayHours,
            mondayHours: resultItem.mondayHours,
            organizationId: this.dataService.organization,
            payRate: resultItem.payRate,
            saturdayHours: resultItem.saturdayHours,
            shiftId: resultItem.shift,
            sundayHours: resultItem.sundayHours,
            thursdayHours: resultItem.thursdayHours,
            totalHours: null,
            totalPay: null,
            tuesdayHours: resultItem.tuesdayHours,
            wednesdayHours: resultItem.wednesdayHours,
          };
          this.employeeShift["totalHours"] = calculateTotalHours(this.employeeShift);
          this.employeeShift["totalPay"] = calculateTotalpay(this.employeeShift);
        }
        

        if (this.timesheet.type === 1) {
          this.timesheet.payrollcycle = 0;

          this.timesheetEmployee = {
            // employee: employee,
            employeeId: employeeId.employeeId,
            employeeShifts: [this.employeeShift],
            expenses: resultItem.expenses,
            organizationId: this.dataService.organization,
            groupId: resultItem.groupId,
            deductions: resultItem.deductions,
            grossPay: null,
          };

          this.timesheetEmployees.push(this.timesheetEmployee);
          this.timesheetEmployee["grossPay"] = onInputChanged(
            this.timesheetEmployee
          );
          this.totalGrossPay += this.timesheetEmployee.grossPay;
        } else if (this.timesheet.type === 2) {
          
          this.timesheetEmployee = {
            organizationId: this.dataService.organization,
            employeeId: employeeId.employeeId,
            groupId: resultItem.groupId,
            bonus: resultItem.bonus,
            otherAllowance: resultItem.otherAllowance,
            deductions: resultItem.deductions,
            bik: resultItem.bik,
            grossPay: null,

            expenses: resultItem.expenses,
            employeePensionContribution: resultItem.employeePensionContribution,
            employeerPensionContribution:
              resultItem.employeerPensionContribution,
          };

          this.timesheetEmployees.push(this.timesheetEmployee);
          this.timesheetEmployee["grossPay"] = calculateTaxablePay(
            this.timesheetEmployee,employeeId
          );
          this.totalGrossPay += this.timesheetEmployee.grossPay;

        }
      });
        this.timesheet.subTotal = this.totalGrossPay;

      if (this.timesheetEmployees.length === 0) {
        this.openSnackBar(
          "Employees in Excel file are not part of this organziation",
          false
        );
        return;
      }
      this.loading = true;
      var options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };

      this.http
        .post(
          `https://api.samotplatform.com/organization/timesheet`,
          this.timesheet,
          { headers: options }
        )
        .pipe(
          catchError((error) => {
            let errorMessage = "";
            if (error.status >= 400 && error.status < 500) {
              errorMessage = "Client error occurred: " + error.status;
            } else if (error.status >= 500) {
              errorMessage = "Server error occurred: " + error.status;
            } else {
              errorMessage = "An error occurred: " + error.status;
            }

            this.openSnackBar(errorMessage, false);
            this.loading = false;
            return throwError(error);
          })
        )
        .subscribe((data: any) => {
          this.employees.push(data);

          this.dataSource.data = this.employees;
          this.loading = false;
          this.openSnackBar(" TimeSheet Created Successfully!", true);
        });
      // Notify after processing all timesheets
      if (countTimeSheet > 0) {
      }
    });
    function preprocessResultItem(resultItem) {
      for (const key in resultItem) {
        if (
          resultItem.hasOwnProperty(key) &&
          typeof resultItem[key] === "string" &&
          resultItem[key].trim() === ""
        ) {
          resultItem[key] = null;
        }
      }
    }
    function calculateTotalHours(employeeShift) {
      let totalHours = 0;
  
      // Add up all the hours for the shift
      if (employeeShift.mondayHours) totalHours += Number(employeeShift.mondayHours);
      if (employeeShift.tuesdayHours) totalHours += Number(employeeShift.tuesdayHours);
      if (employeeShift.wednesdayHours) totalHours += Number(employeeShift.wednesdayHours);
      if (employeeShift.thursdayHours) totalHours += Number(employeeShift.thursdayHours);
      if (employeeShift.fridayHours) totalHours += Number(employeeShift.fridayHours);
      if (employeeShift.saturdayHours) totalHours += Number(employeeShift.saturdayHours);
      if (employeeShift.sundayHours) totalHours += Number(employeeShift.sundayHours);
  
      return totalHours;
    }
    function calculateGrossPay(annualSalary: number,timesheet): number {
  
      if (timesheet.payrollcycle === 1) {
        
        return annualSalary / 52;
      } else if (  timesheet.payrollcycle === 2) {
        return (annualSalary / 52) * 2;
      } else if (  timesheet.payrollcycle === 3) {
        return (annualSalary / 12) ;
      } else {
        return 0;
      }
    }
    function  calculateTaxablePay(timesheetEmployee,employeeId): number {
      const grossPay = employeeId.annualSalary;
    
      const bonus = (timesheetEmployee.bonus || 0);
      const allowance = (timesheetEmployee.otherAllowance || 0);
      const deductions = (timesheetEmployee.deductions || 0);
      const bik = (timesheetEmployee.bik || 0);
    
      const taxablePay = grossPay + bonus + allowance - deductions + bik;
    
    
      return taxablePay;
    }
  
    function calculateTotalpay(employeeShift) {
     
     return employeeShift.totalPay =Number(employeeShift.totalHours) * Number(employeeShift.payRate);  
    
    }
    function onInputChanged(employee: Employee): any {
      var totalPayForEmployeeShifts = 0;
      if (employee.employeeShifts !== undefined) {
        totalPayForEmployeeShifts = employee.employeeShifts.reduce(
          (totalPay, empShift) => {
            return totalPay + (empShift.totalPay || 0);
          },
          0
        );
      }
      if (employee.grossPay == null || undefined) employee.grossPay = 0;
      employee.grossPay =
        (totalPayForEmployeeShifts || 0) +
        (employee.expenses || 0) -
        (employee.deductions || 0);

      // this.totalGrossPay = this.dataService.employees.reduce((total, emp) => {
      //   return total + (emp.grossPay || 0);
      // }, 0);
      return employee.grossPay;
    }
  }

  statusApproved(element: any) {
    this.statusApproverObject.timesheet = element;
    this.statusApproverObject.timesheetId = element.timesheetId;
    this.statusApproverObject.userId = this.dataService.loggedInAdmin.user_id;
    this.statusApproverObject.status = 4;
    this.statusApproverObject.organizationId = this.dataService.organization;

    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.loading = true;
    if (!this.dataService.selectedOrganizationUnit) {
      this.http
        .patch(
          `https://api.samotplatform.com/Organization/TimesheetStatus/` +
            this.statusApproverObject.timesheetId,
          this.statusApproverObject,
          { headers: options }
        )
        .pipe(
          catchError((error) => {
            if (error.status >= 400 && error.status < 500) {
              this.openSnackBar(
                "Client error occurred:  " + error.status,
                false
              );
              this.loading = false;
            } else if (error.status >= 500) {
              this.openSnackBar(
                "Server error occurred: " + error.status,
                false
              );
              this.loading = false;
            } else {
              this.openSnackBar("An error occurred: " + error.status, false);
              this.loading = false;
            }
            return throwError(error);
          })
        )
        .subscribe((data: any) => {
          if (data.length === 0) {
            this.loading = false; // Stop loader if there is no data
            return;
          }
          this.loading = false;
          element.status = data.status;
          element.isCurrentAdmin = false;
          this.openSnackBar("TimeSheet Approved Successfully!", true);
        });
    } else {
      this.statusApproverObject.groupId =
        this.dataService.selectedOrganizationUnit;
      this.http
        .patch(
          `https://api.samotplatform.com/TimesheetStatus/` +
            this.statusApproverObject.timesheetId,
          this.statusApproverObject,
          { headers: options }
        )
        .pipe(
          catchError((error) => {
            if (error.status >= 400 && error.status < 500) {
              this.openSnackBar(
                "Client error occurred:  " + error.status,
                false
              );
              this.loading = false;
            } else if (error.status >= 500) {
              this.openSnackBar(
                "Server error occurred: " + error.status,
                false
              );
              this.loading = false;
            } else {
              this.openSnackBar("An error occurred: " + error.status, false);
              this.loading = false;
            }
            return throwError(error);
          })
        )
        .subscribe((data: any) => {
          if (data.length === 0) {
            this.loading = false; // Stop loader if there is no data
            return;
          }
          this.loading = false;
          element.status = data.status;
          element.isCurrentAdmin = false;
          this.openSnackBar("TimeSheet Approved Successfully!", true);
        });
    }
  }
  statusRejected(element: any) {
    this.statusApproverObject.timesheet = element;
    this.statusApproverObject.timesheetId = element.timesheetId;
    this.statusApproverObject.userId = this.dataService.loggedInAdmin.user_id;
    this.statusApproverObject.status = 5;
    this.statusApproverObject.organizationId = this.dataService.organization;

    if (!this.dataService.selectedOrganizationUnit) {
      var options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.loading = true;
      this.http
        .patch(
          `https://api.samotplatform.com/Organization/TimesheetStatus/` +
            this.statusApproverObject.timesheetId,
          this.statusApproverObject,
          { headers: options }
        )
        .pipe(
          catchError((error) => {
            if (error.status >= 400 && error.status < 500) {
              this.openSnackBar(
                "Client error occurred:  " + error.status,
                false
              );
              this.loading = false;
            } else if (error.status >= 500) {
              this.openSnackBar(
                "Server error occurred: " + error.status,
                false
              );
              this.loading = false;
            } else {
              this.openSnackBar("An error occurred: " + error.status, false);
              this.loading = false;
            }
            return throwError(error);
          })
        )
        .subscribe((data: any) => {
          if (data.length === 0) {
            this.loading = false; // Stop loader if there is no data
            return;
          }
          this.loading = false;
          element.status = data.status;
          element.isCurrentAdmin = false;
          this.openSnackBar("TimeSheet Rejected!", true);
        });
    } else {
      this.statusApproverObject.groupId =
        this.dataService.selectedOrganizationUnit;
      var options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.loading = true;
      this.http
        .patch(
          `https://api.samotplatform.com/TimesheetStatus/` +
            this.statusApproverObject.timesheetId,
          this.statusApproverObject,
          { headers: options }
        )
        .pipe(
          catchError((error) => {
            if (error.status >= 400 && error.status < 500) {
              this.openSnackBar(
                "Client error occurred:  " + error.status,
                false
              );
              this.loading = false;
            } else if (error.status >= 500) {
              this.openSnackBar(
                "Server error occurred: " + error.status,
                false
              );
              this.loading = false;
            } else {
              this.openSnackBar("An error occurred: " + error.status, false);
              this.loading = false;
            }
            return throwError(error);
          })
        )
        .subscribe((data: any) => {
          if (data.length === 0) {
            this.loading = false; // Stop loader if there is no data
            return;
          }
          this.loading = false;
          element.status = data.status;
          element.isCurrentAdmin = false;
          this.openSnackBar("TimeSheet Rejected!", true);
        });
    }
  }
  isStatusPendingOrApproved(): boolean {
    if (this.selection.selected.length > 0) {
      const firstSelectedTimesheet = this.selection.selected[0];
      return !(
        firstSelectedTimesheet.status === 2 ||
        firstSelectedTimesheet.status === 4
      );
    }
    return true;
  }
}
export interface Organization {
  name: string;
  Name: string;
  id: string;
  OrganizationId: number;
}
export interface OrganizationUnit {
  name: string;
  id: string;
  groupId: number;
}

export interface loggedInAdmin {
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  margin: number;
  status: string;
  user_roles: any[];
}
