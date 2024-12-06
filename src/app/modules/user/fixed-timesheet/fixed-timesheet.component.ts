import { SelectionModel } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Optional,
  ViewChild,
  numberAttribute,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { EmployeeDataService } from "../services/employe-data.service";
import { SaveChangeComponent } from "../save-change/save-change.component";
import { RejectTimeSheetReasonComponent } from "../reject-time-sheet-reason/reject-time-sheet-reason.component";
import { isEmptyObject } from "jquery";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-fixed-timesheet",
  templateUrl: "./fixed-timesheet.component.html",
  styleUrls: ["./fixed-timesheet.component.css"],
})
export class FixedTimesheetComponent {
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  timesheet: any = {};
  loading = false;
  timesheets: any[] = [];
  isEdit: boolean;
  viewed: any = {};

  employees: Employee[] = [];
  totalPay: number;
  selectedOption: string;
  selection = new SelectionModel<Employee>(true, []);
  selectedRow: any = {};
  selections = new SelectionModel<Employee>(true, []);
  dataSource = new MatTableDataSource<Employee>(this.employees);
  isCurrentApprover: boolean;
  loggedInUser: any = {};
  updatedTimeSheet: any = {};
  // updateTimeSheet: boolean;
  statusApproverObject: any = {};
  displayedColumns: string[] = ['item','Name', 'cost','grossPay','Bonus','Allowance','Deductions','BIK','TaxablePay','Expenses','Pension','Pensions'];


  constructor(
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FixedTimesheetComponent>,
    public dataService: EmployeeDataService,
    public dataservices:DataService,

    private routers: Router,
    public dataservice: EmployeeDataService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  ngOnInit() {
    this.selectedOption = this.data;
    if (this.data) {
      
      this.isEdit = this.data.isEdit;
      this.dataservice.employees = [];
      // Edit mode - use existing data
      this.selectedRow = this.data[0];
      this.timesheet = this.selectedRow;

      var options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      // this.loading = true;
      // this.http
      //   .get<loggedInUser>(`https://dgr.sso.id/oauth2/me`, { headers: options })
      //   .subscribe((data) => {
      //     this.loggedInUser = data;
          this.viewed.organizationId = this.dataservices.organizationId;
          this.viewed.timesheetId = this.selectedRow.timesheetId;
          this.viewed.userId = this.dataservices.userId;
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
            this.dataservices.loggedInUser.user_roles.forEach((role) => {
              if (role == "Approver") {
                var currentApprover = this.selectedRow.timesheetApprovers.find(
                  (x) =>
                    x.approverOrder == this.selectedRow.currentApproverOrder
                );
                this.loading = false;
                if (currentApprover != undefined) {
                  if (
                    currentApprover.user.email === this.dataservices.loggedInUser.email &&
                    currentApprover.status === 1 &&
                    this.selectedRow.status === 1
                  ) {
                    this.isCurrentApprover = true;
                    this.dataService.isCurrentApproverquery=true;


                  }
                }
              }
            });
          }
        // });
        this.dataservice.startOfWeek=this.selectedRow.weekStartDate;
        this.dataservice.endOfWeek=this.selectedRow.weekEndDate;
        this.dataservice.selectedTimesheetType=this.selectedRow.type;
       
        this.selectedRow.timesheetEmployees.map((emp) => {
          
          var employee: any = {};
  
          employee.employeeId = emp.employeeId;
          employee.firstName = emp.employee.firstName;
          employee.lastName = emp.employee.lastName;
          employee.annualSalary = emp.employee.annualSalary;
          employee.TaxablePay = emp.TaxablePay;
          employee.bik = emp.bik;
          employee.bonus = emp.bonus;
          employee.otherAllowance = emp.otherAllowance
          employee.expenses = emp.expenses;
          employee.deductions = emp.deductions;
          employee.grossPay = emp.grossPay;
          employee.employeePensionContribution=emp.employeePensionContribution;
          employee.employeerPensionContribution=emp.employeerPensionContribution;
  
          this.dataservice.addEmployee(employee);  
          this.isEdit=false;
          
          this.calculateGrossPay(employee.annualSalary)
  
          this.calculateTaxablePay(employee);
          this.calculateSubtotal();
          return employee;
        });
       
    } else {
      this.getEmployees();
      // this.selectedOption = this.dataservice.selectedOrganizationUnit;
    }

    
  
  }
  calculateTotalGrossPay(): number {
    return this.dataservice.employees.reduce((total, employee) => {
      return total + this.calculateGrossPay(employee.annualSalary);
    }, 0);
  }
  
  getEmployees(): any {
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.http
      .get<Employee[]>(
        `https://api.samotplatform.com/groups/employees/` +
          this.dataservice.selectedOrganizationUnit,
        { headers: options }
      )
      .subscribe((data) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource<Employee>(this.employees);
        this.dataservice.employees = data;
        this.dataSource.paginator = this.paginator;
        //  this.dataSource.sort = this.sort;
        // this.paginator.pageSize = this.selectedOption;
      });
  }
  calculateGrossPay(annualSalary: number): number {
  
    if (this.dataservice.selectedCycleId === 1 || this.selectedRow.payrollCycle===1) {
      
      return annualSalary / 52;
    } else if (this.dataservice.selectedCycleId === 2 || this.selectedRow.payrollCycle===2) {
      return (annualSalary / 52) * 2;
    } else if (this.dataservice.selectedCycleId === 3 || this.selectedRow.payrollCycle===3) {
      return (annualSalary / 12) ;
    } else {
      return 0;
    }
  }
  calculateSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.TaxablePay || 0);
    }, 0);
  }
  calculateBonusSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.bonus || 0);
    }, 0);
  }
  calculatebikSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.bik || 0);
    }, 0);
  }
  calculatedeductionSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.deductions || 0);
    }, 0);
  }
  calculateexpensesSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.expenses || 0);
    }, 0);
  }
  calculatepensionSubtotal(): number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.employeePensionContribution || 0);
    }, 0);
  }
  calculatepensionerSubtotal():number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.employeerPensionContribution || 0);
    }, 0);
  }
  calculateotherAllowanceSubtotal():number {
    return this.dataservice.employees.reduce((subtotal, employee) => {
      return subtotal + (employee.otherAllowance || 0);
    }, 0);
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

  handleCheckboxChange(row: Employee): void {
    this.changeDetectorRefs.detectChanges();
    this.selections.toggle(row);
    this.selectedRow =
      this.selections.selected.length > 0
        ? this.selections.selected
        : undefined;

    

    // this.totalPay = this.selections.selected.reduce((total, employee) => total + this.calculatePay(employee), 0);
  }
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  
  calculateTaxablePay(employee: Employee): number {
    const grossPay = this.calculateGrossPay(employee.annualSalary);
  
    const bonus = (employee.bonus || 0);
    const allowance = (employee.otherAllowance || 0);
    const deductions = (employee.deductions || 0);
    const bik = (employee.bik || 0);
  
    const taxablePay = grossPay + bonus + allowance - deductions + bik;
  
    // Assign the calculated taxablePay to the specific employee
    employee.TaxablePay = taxablePay;
  
    return taxablePay;
  }
  updateTimesheet() {
    this.timesheet.organizationId = this.dataservices.organizationId;
    this.timesheet.type = this.dataservice.selectedTimesheetType;
    this.timesheet.subtotal = this.calculateSubtotal();
    this.timesheet.weekStartDate = this.dataservice.startOfWeek;
    this.timesheet.weekEndDate = this.dataservice.endOfWeek;
    this.loading=true;
    const apiEndpoint = this.dataservice.selectedOrganizationUnit ?
    `https://api.samotplatform.com/Timesheets/` :
    `https://api.samotplatform.com/organization/timesheets/`;
    if (this.timesheet.type == 1) {
      this.timesheet.timesheetEmployees = this.dataservice.employees.map(
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
      this.timesheet.timesheetEmployees = this.dataservice.employees.map(
        (emp) => {
          return {
            organizationId: this.timesheet.organizationId,
            groupId: this.timesheet.groupId,
            timesheetId: this.timesheet.timesheetId,
            employeeId: emp.employeeId,
            bonus: emp.bonus,
            otherAllowance: emp.otherAllowance,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
            bik: emp.bik,
            taxablepay: emp.TaxablePay,
            employeePensionContribution: emp.employeePensionContribution,
            employeerPensionContribution: emp.employeerPensionContribution,
          };
        }
      );
    }
    if(!this.dataService.selectedOrganizationUnit){
    const options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.http
      .put(
        apiEndpoint +
          this.timesheet.timesheetId,
        this.timesheet,
        { headers: options }
      )
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
        this.loading=false;
        this.timesheets.push(this.data);
        const index = this.timesheets.findIndex(
          (e) => e.timesheetId === this.timesheet.timesheetId
        );
        if (index !== -1) {
          this.timesheets[index] = data; // Update the existing employee in the local array
        }
        this.updatedTimeSheet = data;
        this.isCurrentApprover=true;

      });
    }else{
      this.timesheet.GroupId = this.dataservice.selectedOrganizationUnit;
      this.timesheet.timesheetEmployees = this.dataservice.employees.map(
        (emp) => {
          return {
            organizationId: this.timesheet.organizationId,
            groupId: this.timesheet.groupId,
            timesheetId: this.timesheet.timesheetId,
            employeeId: emp.employeeId,
            bonus: emp.bonus,
            otherAllowance: emp.otherAllowance,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
            bik: emp.bik,
            taxablepay: emp.TaxablePay,
            employeePensionContribution: emp.employeePensionContribution,
            employeerPensionContribution: emp.employeerPensionContribution,
          };
        }
      );
      const options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.http
        .put(
          `https://api.samotplatform.com/Timesheets/` +
            this.timesheet.timesheetId,
          this.timesheet,
          { headers: options }
        )
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
          this.loading=false;
          this.timesheets.push(this.data);
          const index = this.timesheets.findIndex(
            (e) => e.timesheetId === this.timesheet.timesheetId
          );
          if (index !== -1) {
            this.timesheets[index] = data; // Update the existing employee in the local array
          }
          this.updatedTimeSheet = data;
          this.isCurrentApprover=true;
  
        });
    }
  }
  onInputChanged(employee: Employee): void {
    if(this.isCurrentApprover){
      this.dataService.updateTimeSheet = true;

    }
    this.isCurrentApprover = false;
    this.calculateTaxablePay(employee);
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
  statusApproved() {
    this.statusApproverObject.timesheetId = this.selectedRow.timesheetId;
    this.statusApproverObject.userId = this.dataservices.userId;
    var getApproverOrder = this.selectedRow.timesheetApprovers.find(
      (y) => (y.user.userId == this.dataservices.loggedInUser.user_id)
    );
    this.statusApproverObject.timesheet = this.selectedRow;
    this.statusApproverObject.approverOrder = getApproverOrder.approverOrder;
    this.statusApproverObject.status = 2;
    this.statusApproverObject.organizationId = this.dataservices.organizationId;
    this.statusApproverObject.statusReason = "";
    // this.statusApproverObject
    if(!this.dataService.selectedOrganizationUnit){
    this.loading = true;
    var options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    this.http
      .put(
        `https://api.samotplatform.com/Organization/Timesheet/ApproverStatus/`,
        this.statusApproverObject,
        { headers: options }
      )
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
  } else{
      this.loading = true;
      this.statusApproverObject.groupId = this.dataService.selectedOrganizationUnit;
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
        .subscribe((data: any) => {
          this.loading = false;
          if (!isEmptyObject(this.updatedTimeSheet)) {
            this.updatedTimeSheet.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
           
            this.dialogRef.close({ emp: this.updatedTimeSheet });
            this.openSnackBar(
              "TimeSheet Approved And Update Successfully!",
              true
            );
          } else {
            this.selectedRow.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
           
            this.dialogRef.close({ emp: this.selectedRow });
            this.openSnackBar("TimeSheet Approved Successfully!", true);
          }
        });
    }
  }
  saveAndApprove() {
    this.timesheet.organizationId = this.dataservices.organizationId;
    this.timesheet.type = this.dataservice.selectedTimesheetType;
    this.timesheet.subtotal = this.calculateSubtotal();;
    this.timesheet.weekStartDate = this.dataservice.startOfWeek;
    this.timesheet.weekEndDate = this.dataservice.endOfWeek;
   this.loading=true;
    if(!this.dataService.selectedOrganizationUnit){
      if (this.timesheet.type == 1) {
        this.timesheet.timesheetEmployees = this.dataservice.employees.map(
          (emp) => {
            return {
              organizationId: this.timesheet.organizationId,
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
        this.timesheet.timesheetEmployees = this.dataservice.employees.map(
          (emp) => {
            return {
              organizationId: this.timesheet.organizationId,
            
              timesheetId: this.timesheet.timesheetId,
              employeeId: emp.employeeId,
              bonus: emp.bonus,
              otherAllowance: emp.otherAllowance,
              deductions: emp.deductions,
              grossPay: emp.grossPay,
              bik: emp.bik,
              taxablepay: emp.TaxablePay,
              employeePensionContribution: emp.employeePensionContribution,
              employeerPensionContribution: emp.employeerPensionContribution,
            };
          }
        );
      }
    const options = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
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
        this.loading=false;
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
        this.statusApproverObject.userId = this.dataservices.loggedInUser.user_id;
        var getApproverOrder = this.selectedRow.timesheetApprovers.find(
          (y) => (y.user.userId == this.dataservices.loggedInUser.user_id)
        );
        this.statusApproverObject.approverOrder =
          getApproverOrder.approverOrder;
        this.statusApproverObject.status = 2;
        this.statusApproverObject.organizationId =
          this.dataservices.organizationId;
        this.statusApproverObject.timesheet = this.selectedRow;
        this.statusApproverObject.statusReason = "";
        // this.statusApproverObject
        this.loading = true;
        var options = {
          Authorization: "Bearer " + localStorage.getItem("token"),
        };
        this.http
          .put(
            `https://api.samotplatform.com/Organization/Timesheet/ApproverStatus/`,
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
            this.updatedTimeSheet.timesheetApprovers.find(
              (x) => x.user.userId == data.userId
            ).status = data.status;
            this.dialogRef.close({ emp: this.updatedTimeSheet });
            this.openSnackBar(
              "TimeSheet Approved and Update Successfully!",
              true
            );
          });
      });
    }else{
    this.timesheet.GroupId = this.dataservice.selectedOrganizationUnit;
    if (this.timesheet.type == 1) {
      this.timesheet.timesheetEmployees = this.dataservice.employees.map(
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
      this.timesheet.timesheetEmployees = this.dataservice.employees.map(
        (emp) => {
          return {
            organizationId: this.timesheet.organizationId,
            groupId: this.timesheet.groupId,
            timesheetId: this.timesheet.timesheetId,
            employeeId: emp.employeeId,
            bonus: emp.bonus,
            otherAllowance: emp.otherAllowance,
            deductions: emp.deductions,
            grossPay: emp.grossPay,
            bik: emp.bik,
            taxablepay: emp.TaxablePay,
            employeePensionContribution: emp.employeePensionContribution,
            employeerPensionContribution: emp.employeerPensionContribution,
          };
        }
      );
    }
    this.loading=true;
      const options = {
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      this.http
        .put(
          `https://api.samotplatform.com/Timesheets/` +
            this.timesheet.timesheetId,
          this.timesheet,
          { headers: options }
        )
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
          this.loading=false;
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
          this.statusApproverObject.userId = this.dataservices.loggedInUser.user_id;
          var getApproverOrder = this.selectedRow.timesheetApprovers.find(
            (y) => (y.user.userId == this.dataservices.loggedInUser.user_id)
          );
          this.statusApproverObject.approverOrder =
            getApproverOrder.approverOrder;
          this.statusApproverObject.status = 2;
          this.statusApproverObject.organizationId =
            this.dataservices.organizationId;
          this.statusApproverObject.groupId =
            this.dataService.selectedOrganizationUnit;
          this.statusApproverObject.timesheet = this.selectedRow;
          this.statusApproverObject.statusReason = "";
          // this.statusApproverObject
          this.loading = true;
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
                  this.openSnackBar("An error occurred: " + error.status, false);
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
              this.dialogRef.close({ emp: this.updatedTimeSheet });
              this.openSnackBar(
                "TimeSheet Approved and Update Successfully!",
                true
              );
            });
        });
    }
  }

  canceldialog() {
    if (this.dataService.updateTimeSheet === true) {
      const dialogRef = this.dialog.open(SaveChangeComponent, {
        width: "24%",
        data: this.timesheet,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result != undefined) {
          result.isCurrentApprover = true;
          this.dialogRef.close({ emp: result });
        } else {
          this.dataService.updateTimeSheet =false;
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
}

export interface Employee {
  name: string;
  hours: number;
  extraHours: number;
  extra: number;
  totalPay: number;
  calculatePay: number;
  TaxablePay: number;
  annualSalary: number;
  bonus: number;
  otherAllowance: number;
  deductions: number;
  bik: number;
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
