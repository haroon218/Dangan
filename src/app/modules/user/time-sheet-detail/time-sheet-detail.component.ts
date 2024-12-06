import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { SelectionModel } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Optional,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeDataService } from "../services/employe-data.service";
import { UserTimesheetRateComponent } from "../user-timesheet-rate/user-timesheet-rate.component";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { catchError, throwError } from "rxjs";
import { RejectTimeSheetReasonComponent } from "../reject-time-sheet-reason/reject-time-sheet-reason.component";
import { SaveChangeComponent } from "../save-change/save-change.component";
import { data, isEmptyObject } from "jquery";
import { Moment } from "moment";
import { MatDatepicker } from "@angular/material/datepicker";
import moment from "moment";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DataService } from "../services/data.service";

const today = new Date();
const dayOfWeek = today.getDay();
const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday

const startOfWeek = new Date(today.setDate(diff));
const endOfWeek = new Date(today.setDate(diff + 6));
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
  selector: "app-time-sheet-detail",
  templateUrl: "./time-sheet-detail.component.html",
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
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
  styleUrls: ["./time-sheet-detail.component.css"],
})
export class TimeSheetDetailComponent {
  loading = false;
  timesheets: any[] = [];
  updatedTimeSheet: any = {};
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  employees: Employee[] = [];
  loggedInUser: any = {};
  editTimeSheet: any[] = [];
  employee: any = {};
  timesheet: any = {};
  statusApproverObject: any = {};
  gettype: any;
  displayedTotalGrossPay: number;
  totalPay: number;
  selectedOption: string;
  selection = new SelectionModel<Employee>(true, []);
  selectedRow: any = {};
  selections = new SelectionModel<Employee>(true, []);
  request: any = {};
  expandedRows: any[] = [];
  isEdit: boolean;
  OrganizationId:any;
  timesheetId:any;
  // updateTimeSheet: boolean;
  payrequest: any = {};
  department: any = {};
  totalGrossPay: number = 0;
  expandedElement: UserTimesheetRateComponent | null;
  Cycle: any;
  // isCurrentApprover: boolean;
  dataSource = new MatTableDataSource<Employee>(this.employees);
  selectedWeek: number;
  selectedTimesheetType: string;
  weeks: string[] = [];
  viewed: any = {};
  timesheetTypes: any[] = [
    {
      id: 1,
      name: "Hourly",
    },
    {
      id: 2,
      name: "Fixed",
    },
  ]; // Example timesheet types
  payrollCycle: any[] = [
    {
      id: 1,
      name: "Weekly",
    },
    {
      id: 2,
      name: "Bi-Weekly",
    },
    {
      id: 3,
      name: "Monthly",
    },
  ];
  displayedColumns: string[] = [
    "fname",
    "Lname",
    "Expenses",
    "deduction",
    "pay",
  ];
  campaignOne = new FormGroup({
    start: new FormControl(startOfWeek),
    end: new FormControl(endOfWeek),
  });
  columnsToDisplayWithExpand = [...this.displayedColumns, "expand"];

  constructor(
    public dialog: MatDialog,
    public dataService: EmployeeDataService,
    public service:DataService,

    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    public dialogRef: MatDialogRef<TimeSheetDetailComponent>,
    private routers: Router,
    private _snackBar: MatSnackBar,    private route:ActivatedRoute,
    
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // if(this.route.queryParams.subscribe(params => {
    //   this.OrganizationId= params['organizationId'];
    //   this.timesheetId = params['timesheetId'];
    // })){
    //   this.service.loggedInUser.user_roles.forEach((role) => {
    //     if (role == "Approver") {
    //       var currentApprover = this.selectedRow.timesheetApprovers.find(
    //         (x) => x.approverOrder == this.selectedRow.currentApproverOrder
    //       );
    //       this.loading = false;
    //       if (currentApprover != undefined) {
    //         if (
    //           currentApprover.user.email === this.service.loggedInUser.email &&
    //           currentApprover.status === 1 &&
    //           this.selectedRow.status === 1
    //         ) {
    //           this.dataService.isCurrentApproverquery = true;

    //         }
    //       }
    //     }
    //   });      }
  }
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngOnInit() {
    const currentDate = moment();
    this.setMonthAndYear(currentDate, null);


    if (this.data) {
      this.isEdit = this.data.isEdit;
      this.gettype = this.data[0].type;
      this.Cycle = this.data[0].payrollCycle;
      this.campaignOne.setValue({
        start: this.data[0].weekStartDate,
        end: this.data[0].weekEndDate,
      });
    }
    this.dataService.selectedcycle = this.payrollCycle[2].id;

    this.dataService.selectedCycleId = this.payrollCycle[2].id;

    this.dataService.selectedTimesheetType = 1;
    this.dataService.employees = [];
    this.selectedRow = this.data[0];
    this.timesheet = this.selectedRow;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    this.loading = true;
   

        // View TimeSheet

        this.viewed.organizationId = this.service.organizationId;
        this.viewed.timesheetId = this.selectedRow.timesheetId;
        this.viewed.userId = this.service.loggedInUser.user_id;
        if (!this.dataService.selectedOrganizationUnit) {
          this.http
            .post(
              `https://api.samotplatform.com/Organization/Timesheets/` +
                this.timesheet.timesheetId +
                `/Viewed`,
              this.viewed,
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
                  this.openSnackBar(
                    "An error occurred: " + error.status,
                    false
                  );
                  this.loading = false;
                }
                return throwError(error);
              })
            )
            .subscribe((resultView) => {
            });
        } else {
          this.viewed.GroupId = this.dataService.selectedOrganizationUnit;
          this.http
            .post(
              `https://api.samotplatform.com/Timesheets/` +
                this.timesheet.timesheetId +
                `/Viewed`,
              this.viewed,
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
                  this.openSnackBar(
                    "An error occurred: " + error.status,
                    false
                  );
                  this.loading = false;
                }
                return throwError(error);
              })
            )
            .subscribe((resultView) => {
            });
        }

        if (
          this.selectedRow.timesheetApprovers.length > 0 &&
          this.selectedRow.currentApproverOrder != null
        ) {
          this.service.loggedInUser.user_roles.forEach((role) => {
            if (role == "Approver") {
              var currentApprover = this.selectedRow.timesheetApprovers.find(
                (x) => x.approverOrder == this.selectedRow.currentApproverOrder
              );
              this.loading = false;
              if (currentApprover != undefined) {
                if (
                  currentApprover.user.email === this.service.loggedInUser.email &&
                  currentApprover.status === 1 &&
                  this.selectedRow.status === 1
                ) {
                  this.dataService.isCurrentApprover = true;
                  this.dataService.isCurrentApproverquery=true;

                }
              }
            }
          });
        }
      

    this.editTimeSheet = [];

    this.dataService.employees = [];
    this.dataService.startOfWeek = this.selectedRow.weekStartDate;
    this.dataService.endOfWeek = this.selectedRow.weekEndDate;
    this.dataService.selectedTimesheetType = this.selectedRow.type;

    this.selectedRow.timesheetEmployees.map((emp) => {
      var employee: any = {};

      employee.employeeId = emp.employeeId;
      employee.firstName = emp.employee.firstName;
      employee.lastName = emp.employee.lastName;
      employee.expenses = emp.expenses;
      employee.deductions = emp.deductions;
      employee.grossPay = emp.grossPay;

      employee.employeeShifts = emp.employeeShifts;

      this.dataService.addEmployee(employee);
      this.isEdit = false;
      return employee;
    });
    this.dataSource.paginator = this.paginator;
    this.dataService.calculateTotalGrossPay();
  }
  durationInSeconds = 3;
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ["success-snackbar"] : ["error-snackbar"];

    this._snackBar.open(message, "✘", {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass,
    });
  }
  date = new FormControl(moment());

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ): void {
    const month: number = normalizedMonthAndYear.month() + 1;
    const year: number = normalizedMonthAndYear.year();
    
    if (this.data) {
      this.dataService.month = parseInt(this.data[0].monthNumber, 10);
      this.dataService.year = parseInt(this.data[0].year, 10);
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
  
  updateTimesheet() {
    this.timesheet.organizationId = this.service.organizationId;
    this.timesheet.GroupId = this.dataService.selectedOrganizationUnit;
    this.timesheet.type = this.dataService.selectedTimesheetType;
    this.timesheet.subtotal = this.dataService.displayedTotalGrossPay;
    this.timesheet.weekStartDate = this.dataService.startOfWeek;
    this.timesheet.weekEndDate = this.dataService.endOfWeek;
    const apiEndpoint = this.dataService.selectedOrganizationUnit
      ? `https://api.samotplatform.com/Timesheets/`
      : `https://api.samotplatform.com/organization/timesheets/`;
    if (this.timesheet.type == 1) {
      this.timesheet.timesheetEmployees = this.dataService.employees.map(
        (emp) => {
          return {
            organizationId: this.timesheet.organizationId,
            groupId: this.timesheet.groupId,
            timesheetId: this.timesheet.timesheetId,
            employeeId: emp.employeeId,
            employeeShifts: this.timesheet.timesheetEmployees.employeeShifts,
            expenses: emp.expenses,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
          };
        }
      );
    } else if (this.timesheet.type == 2) {
      this.timesheet.timesheetEmployees = this.dataService.employees.map(
        (emp) => {
          return {
            employeeId: emp.employeeId,
            bonus: emp.bonus,
            otherAllowance: emp.otherAllowance,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
            bik: emp.bik,
            employeePensionContribution: emp.employeePensionContribution,
            employeerPensionContribution: emp.employeerPensionContribution,
          };
        }
      );
    }
    const options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.loading = true;
    this.http
      .put(apiEndpoint + this.timesheet.timesheetId, this.timesheet, {
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
        this.loading = false;
        this.dataService.isCurrentApprover = true;
        this.timesheets.push(this.data);
        const index = this.timesheets.findIndex(
          (e) => e.timesheetId === this.timesheet.timesheetId
        );
        if (index !== -1) {
          this.timesheets[index] = data; // Update the existing employee in the local array
        }
        this.updatedTimeSheet = data;
        this.dataService.isCurrentApprover = true;
      });
  }
 
  onInputChanged(employee: Employee): void {
    if(this.dataService.isCurrentApprover){
      this.dataService.updateTimeSheet = true;

    }
    this.dataService.isCurrentApprover = false;
    var totalPayForEmployeeShifts = 0;
    if(employee.employeeShifts!== undefined){
      totalPayForEmployeeShifts = employee.employeeShifts.reduce((totalPay, empShift) => {
        return totalPay + (empShift.totalPay || 0);
      }, 0);
    }
    if(employee.grossPay == null || undefined)
    
        employee.grossPay = 0;
    employee.grossPay = (totalPayForEmployeeShifts||0) + (employee.expenses || 0) - (employee.deductions || 0);
    
    
    // this.totalGrossPay = this.dataService.employees.reduce((total, emp) => {
    //   return total + (emp.grossPay || 0);
    // }, 0);
  this.dataService.calculateTotalGrossPay();
    this.changeDetectorRefs.detectChanges();
  }




  generateWeeksAndDays(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentMonth,
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentMonth + 1,
      0
    );

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

      // Move to the next week
      currentWeekStartDate = new Date(
        currentWeekEndDate.getFullYear(),
        currentWeekEndDate.getMonth(),
        currentWeekEndDate.getDate() + 1
      );
      currentWeekEndDate = currentWeekStartDate;
    }
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor(
      (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  }
  getGrossPay(employeeId: string): number | undefined {
    const employee = this.department.timesheetEmployees.find(
      (e) => e.employeeId === employeeId
    );
    return employee?.grossPay;
  }
  getWeekNumberAndDatesFromLabel(weekLabel: string): string {
    // Extract week number from the label (assuming it starts with 'Week {number}:')
    const regex = /Week (\d+):/;
    const match = weekLabel.match(regex);
    const weekNumber = match ? match[1] : 0;

    // Extract start and end dates from the label
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}) - (\d{1,2}\/\d{1,2}\/\d{4})/;
    const dateMatch = weekLabel.match(dateRegex);
    const startDate = dateMatch ? dateMatch[1] : "";
    const endDate = dateMatch ? dateMatch[2] : "";

    return `Week ${weekNumber}: ${startDate} - ${endDate}`;
  }
  handlePage(event: any) {}

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.dataSource.data.forEach((row) => this.selection.select(row));
    // this.calculateTotalPay();
  }
  checkboxLabel(row?: Employee): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    const index = this.dataSource.data.indexOf(row) + 1;
    return `${
      this.selection.isSelected(row) ? "deselect" : "select"
    } row ${index}`;
  }

  toggleExpansion(element: any): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }
  handleCheckboxChange(row: Employee): void {
    this.changeDetectorRefs.detectChanges();
    this.selections.toggle(row);
    this.selectedRow =
      this.selections.selected.length > 0
        ? this.selections.selected
        : undefined;
    // this.totalPay = this.selections.selected.reduce(
    //   (total, employee) => total + this.calculatePay(employee),
    //   0
    // );
    // console.log("Selected:", this.selectedRow);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  statusApproved() {
    this.statusApproverObject.timesheetId = this.selectedRow.timesheetId;
    this.statusApproverObject.userId = this.service.loggedInUser.user_id;
    var getApproverOrder = this.selectedRow.timesheetApprovers.find(
      (y) => y.user.userId == this.service.loggedInUser.user_id
    );

    this.statusApproverObject.approverOrder = getApproverOrder.approverOrder;
    this.statusApproverObject.status = 2;
    this.statusApproverObject.organizationId = this.service.organizationId;
    this.statusApproverObject.statusReason = "";
    // this.statusApproverObject
    this.loading = true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    if (!this.dataService.selectedOrganizationUnit) {
      this.http
        .put(
          `https://api.samotplatform.com/Organization/Timesheet/ApproverStatus`,
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
          this.loading = false;
          if (!isEmptyObject(this.updatedTimeSheet)) {
            this.updatedTimeSheet.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
            var approverOrder = this.updatedTimeSheet.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).approverOrder;
            if (approverOrder == 2) {
              this.updatedTimeSheet.status = data.status;
              this.selectedRow.isCurrentApprover = false;
            }
            this.dialogRef.close({ emp: this.updatedTimeSheet });
            this.openSnackBar(
              "TimeSheet Approved And Update Successfully!",
              true
            );
          } else {
            this.selectedRow.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
            var approverOrder = this.selectedRow.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).approverOrder;
            if (approverOrder == 2) {
              this.selectedRow.status = data.status;
              this.selectedRow.isCurrentApprover = false;
            }
            this.selectedRow.isCurrentApprover = false;
            this.dialogRef.close({ emp: this.selectedRow });
            this.openSnackBar("TimeSheet Approved Successfully!", true);
          }
        });
    } else {
      this.statusApproverObject.groupId =
        this.dataService.selectedOrganizationUnit;
      this.http
        .put(
          `https://api.samotplatform.com/Timesheet/ApproverStatus/`,
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
          this.loading = false;
          if (!isEmptyObject(this.updatedTimeSheet)) {
            this.updatedTimeSheet.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
            var approverOrder = this.updatedTimeSheet.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).approverOrder;
            if (approverOrder == 2) {
              this.updatedTimeSheet.status = data.status;
              this.selectedRow.isCurrentApprover = false;
            }
            this.dialogRef.close({ emp: this.updatedTimeSheet });
            this.openSnackBar(
              "TimeSheet Approved And Update Successfully!",
              true
            );
          } else {
            this.selectedRow.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
            var approverOrder = this.selectedRow.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).approverOrder;
            if (approverOrder == 2) {
              this.selectedRow.status = data.status;
              this.selectedRow.isCurrentApprover = false;
            }
            this.selectedRow.isCurrentApprover = false;
            this.dialogRef.close({ emp: this.selectedRow });
            this.openSnackBar("TimeSheet Approved Successfully!", true);
          }
        });
    }
  }

  statusRejected() {
    const dialogRef = this.dialog.open(RejectTimeSheetReasonComponent, {
      width: "30%",

      data: this.selectedRow,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isEmptyObject(this.updatedTimeSheet)) {
        this.updatedTimeSheet.timesheetApprovers.find(
          (x) => x.user.userId == result.userId
        ).status = result.status;
        this.updatedTimeSheet.status = result.status;
        this.updatedTimeSheet.isCurrentApprover = false;
        this.dialogRef.close({ emp: this.updatedTimeSheet });
        this.openSnackBar(
          "Timesheet Rejected! But Update Successfully!",
          false
        );
      } else {
        this.selectedRow.timesheetApprovers.find(
          (x) => x.user.userId == result.userId
        ).status = result.status;
        this.selectedRow.status = result.status;
        this.selectedRow.isCurrentApprover = false;
        this.dialogRef.close({ emp: this.selectedRow });
        this.openSnackBar("TimeSheet Rejected!", false);
      }
    });
  }

  canceldialog() {
    if (this.dataService.updateTimeSheet == true) {
      const dialogRef = this.dialog.open(SaveChangeComponent, {
        width: "24%",
        data: this.timesheet,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result != undefined) {
          result.isCurrentApprover = true;
          this.dialogRef.close({ emp: result });
        } else {
          this.dialogRef.close({ emp: result });
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
 
  saveAndApprove(){
  
      this.timesheet.organizationId=this.service.organizationId;
      this.timesheet.type = this.dataService.selectedTimesheetType;
      this.timesheet.subtotal=this.dataService.displayedTotalGrossPay;
      this.timesheet.weekStartDate=this.dataService.startOfWeek;
      this.timesheet.weekEndDate=this.dataService.endOfWeek;
     
      if(!this.dataService.selectedOrganizationUnit){
        if( this.timesheet.type==1){
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
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.loading = true;
      this.http
        .put(
          `https://api.samotplatform.com/Organization/Timesheets/` +
            this.timesheet.timesheetId,
          this.timesheet,
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
        .subscribe((data) => {
          this.loading = false;
          this.dataService.isCurrentApprover = true;
          this.timesheets.push(this.data);
          const index = this.timesheets.findIndex(
            (e) => e.timesheetId === this.timesheet.timesheetId
          );
          if (index !== -1) {
            this.timesheets[index] = data;
          }
          this.updatedTimeSheet = data;

          // Approve TimeSheet
          this.statusApproverObject.timesheetId = this.selectedRow.timesheetId;
          this.statusApproverObject.userId = this.service.loggedInUser.user_id;
          var getApproverOrder = this.selectedRow.timesheetApprovers.find(
            (y) => y.user.userId == this.service.loggedInUser.user_id
          );
          this.statusApproverObject.approverOrder =
            getApproverOrder.approverOrder;
          this.statusApproverObject.status = 2;
          this.statusApproverObject.organizationId =
            this.service.organizationId;

          this.statusApproverObject.statusReason = "";
          // this.statusApproverObject
          if (!this.dataService.selectedOrganizationUnit) {
            this.loading = true;
            var options = {
              Authorization: "Bearer " + localStorage.getItem("token"),
            };
            this.http
              .put(
                `https://api.samotplatform.com/Organization/Timesheet/ApproverStatus`,
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
                    this.openSnackBar(
                      "An error occurred: " + error.status,
                      false
                    );
                    this.loading = false;
                  }
                  return throwError(error);
                })
              )
              .subscribe((data: any) => {
                this.loading = false;
                this.updatedTimeSheet.timesheetApprovers.find(
                  (x) => x.user.userId == data.userId
                ).status = data.status;
                var approverOrder =
                  this.updatedTimeSheet.timesheetApprovers.find(
                    (x) => x.user.userId == data.userId
                  ).approverOrder;
                if (approverOrder == 2) {
                  this.updatedTimeSheet.status = data.status;
                  this.selectedRow.isCurrentApprover = false;
                }
                this.dialogRef.close({ emp: this.updatedTimeSheet });
                this.openSnackBar(
                  "TimeSheet Approved and Update Successfully!",
                  true
                );
              });
          } else {
            this.statusApproverObject.groupId =
              this.dataService.selectedOrganizationUnit;
            var options = {
              Authorization: "Bearer " + localStorage.getItem("token"),
            };
            this.http
              .put(
                `https://api.samotplatform.com/Timesheet/ApproverStatus/`,
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
                    this.openSnackBar(
                      "An error occurred: " + error.status,
                      false
                    );
                    this.loading = false;
                  }
                  return throwError(error);
                })
              )
              .subscribe((data: any) => {
                this.loading = false;
                this.updatedTimeSheet.timesheetApprovers.find(
                  (x) => x.user.userId == data.userId
                ).status = data.status;
                var approverOrder =
                  this.updatedTimeSheet.timesheetApprovers.find(
                    (x) => x.user.userId == data.userId
                  ).approverOrder;
                if (approverOrder == 2) {
                  this.updatedTimeSheet.status = data.status;
                  this.selectedRow.isCurrentApprover = false;
                }
                this.dialogRef.close({ emp: this.updatedTimeSheet });
                this.openSnackBar(
                  "TimeSheet Approved and Update Successfully!",
                  true
                );
              });
          }
        });
    } else {
      this.timesheet.GroupId = this.dataService.selectedOrganizationUnit;
      if( this.timesheet.type==1){
        this.timesheet.timesheetEmployees= this.dataService.employees.map(emp => {
          return {
            organizationId:this.timesheet.organizationId,
            groupId:this.timesheet.groupId,
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
        .subscribe((data) => {
          this.loading = false;
          this.dataService.isCurrentApprover = true;
          this.timesheets.push(this.data);
          const index = this.timesheets.findIndex(
            (e) => e.timesheetId === this.timesheet.timesheetId
          );
          if (index !== -1) {
            this.timesheets[index] = data;
          }
          this.updatedTimeSheet = data;

          // Approve TimeSheet
          this.statusApproverObject.timesheetId = this.selectedRow.timesheetId;
          this.statusApproverObject.userId = this.service.loggedInUser.user_id;
          var getApproverOrder = this.selectedRow.timesheetApprovers.find(
            (y) => y.user.userId == this.loggedInUser.user_id
          );
          this.statusApproverObject.approverOrder =
            getApproverOrder.approverOrder;
          this.statusApproverObject.status = 2;
          this.statusApproverObject.organizationId =
            this.service.organizationId;

          this.statusApproverObject.statusReason = "";
          // this.statusApproverObject
          if (!this.dataService.selectedOrganizationUnit) {
            this.loading = true;
            var options = {
              Authorization: "Bearer " + localStorage.getItem("token"),
            };
            this.http
              .put(
                `https://api.samotplatform.com/Organization/Timesheet/ApproverStatus`,
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
                    this.openSnackBar(
                      "An error occurred: " + error.status,
                      false
                    );
                    this.loading = false;
                  }
                  return throwError(error);
                })
              )
              .subscribe((data: any) => {
                this.loading = false;
                this.updatedTimeSheet.timesheetApprovers.find(
                  (x) => x.user.userId == data.userId
                ).status = data.status;
                var approverOrder =
                  this.updatedTimeSheet.timesheetApprovers.find(
                    (x) => x.user.userId == data.userId
                  ).approverOrder;
                if (approverOrder == 2) {
                  this.updatedTimeSheet.status = data.status;
                  this.selectedRow.isCurrentApprover = false;
                }
                this.dialogRef.close({ emp: this.updatedTimeSheet });
                this.openSnackBar(
                  "TimeSheet Approved and Update Successfully!",
                  true
                );
              });
          } else {
            this.statusApproverObject.groupId =
              this.dataService.selectedOrganizationUnit;
            var options = {
              Authorization: "Bearer " + localStorage.getItem("token"),
            };
            this.http
              .put(
                `https://api.samotplatform.com/Timesheet/ApproverStatus/`,
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
                    this.openSnackBar(
                      "An error occurred: " + error.status,
                      false
                    );
                    this.loading = false;
                  }
                  return throwError(error);
                })
              )
              .subscribe((data: any) => {
                this.loading = false;
                this.updatedTimeSheet.timesheetApprovers.find(
                  (x) => x.user.userId == data.userId
                ).status = data.status;
                var approverOrder =
                  this.updatedTimeSheet.timesheetApprovers.find(
                    (x) => x.user.userId == data.userId
                  ).approverOrder;
                if (approverOrder == 2) {
                  this.updatedTimeSheet.status = data.status;
                  this.selectedRow.isCurrentApprover = false;
                }
                this.dialogRef.close({ emp: this.updatedTimeSheet });
                this.openSnackBar(
                  "TimeSheet Approved and Update Successfully!",
                  true
                );
              });
          }
        });
    }
  }
}

export interface Employee {
  firstName: string;
  lastName: string;
  OrganizationId: number;
  GroupId: number;
  employeeId: string;
  name: string;
  hours: number;
  rate: string;
  pay: number;
  totalPay: number;
  calculatePay: number;
  title: string;
  columnName: string;
  employeeJobs: any[];
  shifts: any[];
  employeeShifts: any[];
  expenses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  totalGrossPay: number;
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
export interface loggedInUser {
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  margin: number;
  status: string;
  user_roles: any[];
}
