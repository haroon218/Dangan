import { SelectionModel } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Optional,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { AdminDataServicesService } from "../services/admin-data-services.service";
import { FormGroup, FormControl } from "@angular/forms";
import { default as _rollupMoment, Moment } from "moment";
import {
  MatCalendarCellCssClasses,
  MatDatepicker,
} from "@angular/material/datepicker";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { event } from "jquery";
import * as _moment from "moment";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from "@angular/material-moment-adapter";

//  const today = new Date();
// const dayOfWeek = today.getDay();
// const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
const moment = _rollupMoment || _moment;

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
  selector: "app-time-sheet-form",
  templateUrl: "./time-sheet-form.component.html",
  styleUrls: ["./time-sheet-form.component.css"],
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
})
export class TimeSheetFormComponent {
  employees: Employee[] = [];
  selectedWeek: number;
  Ounits: Ounit[] = [];
  edit: string;
  totalPay: number;
  timesheet: any = {};
  selectedOption: number;
  // date = new FormControl(); // Initialize form control for date
  selectedOrgUnit: number;
  selection = new SelectionModel<Employee>(true, []);
  selectedRow: any;
  selections = new SelectionModel<Employee>(true, []);
  loading = false;
  dataSource = new MatTableDataSource<Employee>(this.employees);
  //selectedTimesheetType: number;
  selectedType: number;
  isEdit: boolean;
  totalGrossPay: number;
  campaignOne: any;
  gettype: any;
  Cycle: any;
  selectype: number;
  horizontalPosition: MatSnackBarHorizontalPosition = "right";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  weeks: string[] = [];
  timesheetTypes: any[] = [
    {
      id: 1,
      name: "Hourly",
    },
    {
      id: 2,
      name: "Fixed",
    },
  ];
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
  ssoUrl = "https://dgr.sso.id/";
  baseUrl = "https://api.samotplatform.com/";

  displayedColumns: string[] = [
    "select",
    "name",
    " Org",
    "Approver",
    "Rate1Hours",
    "Rate2Hours",
    "Rate3Hours",
    "Rate4Hours",
    "Rate5Hours",
    "Rate6Hours",
    "Holiday",
    "Bank",
    "Expenses",
    "deduction",
    "pay",
  ];
  displayedTotalGrossPay: number;
  
  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public dataService: AdminDataServicesService,
    // private changeDetectorRefs: ChangeDetectorRef,
    // private http: HttpClient,
    public dialogRef: MatDialogRef<TimeSheetFormComponent>,
    // private routers: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  durationInSeconds = 1;
  openSnackBar(message) {
    this._snackBar.open(message, "Ok", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  ngOnInit() {
    const currentDate = moment();
    this.dataService.selectedTimesheetType = 1;
    this.dataService.selectedcycle = this.payrollCycle[2].id;
    this.dataService.selectedCycleId = this.payrollCycle[2].id;
    if (this.data) {
      this.isEdit = this.data.isEdit;
      this.selectedRow = this.data[0];
      this.gettype = this.data[0].type;
      this.Cycle = this.data[0].payrollCycle;
    }
    if (this.dataService.selectedTimesheetType === 1) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

      this.dataService.startOfWeek = new Date(today.setDate(diff));
      this.dataService.endOfWeek = new Date(this.dataService.startOfWeek);
      this.dataService.endOfWeek.setDate(
        this.dataService.endOfWeek.getDate() + 6
      );

      this.campaignOne = new FormGroup({
        start: new FormControl(this.dataService.startOfWeek),
        end: new FormControl(this.dataService.endOfWeek),
      });

      this.campaignOne.valueChanges.subscribe((value) => {
        if (value.start instanceof Date) {
          this.dataService.startOfWeek = value.start;
        }

        if (value.end instanceof Date) {
          this.dataService.endOfWeek = value.end;
        }
      });
      
    }


    

    // const today = new Date();
    // const dayOfWeek = today.getDay();
    // const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    // this.dataService.startOfWeek = new Date(today.setDate(diff));
    // this.dataService.endOfWeek = new Date(this.dataService.startOfWeek);
    // this.dataService.endOfWeek.setDate(
    //   this.dataService.endOfWeek.getDate() + 6
    // );

    // this.campaignOne = new FormGroup({
    //   start: new FormControl(this.dataService.startOfWeek),
    //   end: new FormControl(this.dataService.endOfWeek),
    // });

    // this.campaignOne.valueChanges.subscribe((value) => {
    //   if (value.start instanceof Date) {
    //     this.dataService.startOfWeek = value.start;
    //   }

    //   if (value.end instanceof Date) {
    //     this.dataService.endOfWeek = value.end;
    //   }
    //   if (
    //     !this.isFullWeek(
    //       this.dataService.startOfWeek,
    //       this.dataService.endOfWeek
    //     )
    //   ) {
    //     // Show an error message and reset the dates to the initial values
    //     this.openSnackBar("Please select a full week (Monday to Sunday)");
    //     this.campaignOne = new FormGroup({
    //       start: new FormControl((this.dataService.startOfWeek = null)),
    //       end: new FormControl(this.dataService.endOfWeek == null),
    //     });
    //   }
    // });

    if (this.data) {
      this.isEdit = this.data.isEdit;
      this.campaignOne.setValue({
        start: this.selectedRow.weekStartDate,
        end: this.selectedRow.weekEndDate,
      });
    }
    this.setMonthAndYear(currentDate, null);
  }
  isFullWeek(startDate: Date, endDate: Date): boolean {
    if (!startDate || !endDate) {
      return false;
    }

    const startDayOfWeek = startDate.getDay();
    const endDayOfWeek = endDate.getDay();

    return startDayOfWeek === 1 && endDayOfWeek === 0;
  }

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
  
  
  date = new FormControl(moment());

  // setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
  //   const formattedDate = normalizedMonthAndYear.format('MM/YYYY'); // Format the date to "MM/YYYY"
  //   const momentDate = moment(formattedDate, 'MM/YYYY'); // Convert the formatted string back to a Moment object
  //   this.date.setValue(momentDate); // Set formatted date value
  //   datepicker.close(); // Close the datepicker
  // }
  
  currentDayOfWeek = moment().isoWeekday();

  dateClass = (date: Date): MatCalendarCellCssClasses => {
    const dayOfWeek = moment(date).isoWeekday();

    return {
      'current-week': dayOfWeek === this.currentDayOfWeek,
    };
  }

  onPayrollCycleChange(event: any) {
    this.dataService.selectedCycleId = event.value;

    if (this.dataService.selectedCycleId == 2) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

      this.dataService.startOfWeek = new Date(today.setDate(diff));
      this.dataService.endOfWeek = new Date(this.dataService.startOfWeek);
      this.dataService.endOfWeek.setDate(
        this.dataService.endOfWeek.getDate() + 13
      );

      this.campaignOne = new FormGroup({
        start: new FormControl(this.dataService.startOfWeek),
        end: new FormControl(this.dataService.endOfWeek),
      });

      this.campaignOne.valueChanges.subscribe((value) => {
        if (value.start instanceof Date) {
          this.dataService.startOfWeek = value.start;
        }

        if (value.end instanceof Date) {
          this.dataService.endOfWeek = value.end;
        }

        // this.generateWeeksAndDays();
      });
    }

    if (this.dataService.selectedCycleId == 1) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

      this.dataService.startOfWeek = new Date(today.setDate(diff));
      this.dataService.endOfWeek = new Date(this.dataService.startOfWeek);
      this.dataService.endOfWeek.setDate(
        this.dataService.endOfWeek.getDate() + 6
      );

      this.campaignOne = new FormGroup({
        start: new FormControl(this.dataService.startOfWeek),
        end: new FormControl(this.dataService.endOfWeek),
      });

      this.campaignOne.valueChanges.subscribe((value) => {
        if (value.start instanceof Date) {
          this.dataService.startOfWeek = value.start;
        }

        if (value.end instanceof Date) {
          this.dataService.endOfWeek = value.end;
        }
      });
    }
  }

  canceldialog() {
    this.dialogRef.close();
  }

  // onInputChanged(): void {
  //   this.calculateTotalPay();
  // }

  // calculatePay(employee: Employee): number {
  //   const standardHourlyRate = 10;
  //   const extraHourlyRate = 10;

  //   const standardPay = employee.hours * standardHourlyRate;
  //   const extraPay = employee.extraHours * extraHourlyRate;

  //   const totalPay = standardPay + extraPay;

  //   // Assign the calculated totalPay to the specific employee
  //   employee.totalPay = totalPay;

  //   return totalPay;
  // }

  handleGrandTotalChanged(totalGrossPay: number): void {
    // Update the displayedTotalGrossPay property
    this.displayedTotalGrossPay = totalGrossPay;
  }
  // calculateTotalPay(): void {
  //   this.totalPay = this.selection.selected.reduce((total, employee) => total + this.calculatePay(employee), 0);
  // }

  cancelDialog() {
    this.dialogRef.close();
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
export class employeeShift {
  OrganizationId: number;
  GroupId: number;
  employeeId: string;
  shiftId: number;
  payrate: number;
  mondayhours: number;
  tuesdayhours: number;
  wednesdayhours: number;
  thursdayhours: number;
  fridayhours: number;
  saturdayhours: number;
  sundayhours: number;
  totalhours: number;
  totalpay: number;
}
export interface Ounit {
  GroupName: string;
  GroupId: number;
  idpId: string;
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

interface HourlyRates {}
