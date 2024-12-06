import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FloatLabelType } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, catchError, map, startWith, throwError } from 'rxjs';


export interface Employee {
  firstName:string;
  email:string;
  address:string;
  city:string;
  annualSalary:number;
  employeeStatus:number;
  gender:string;
  lastName:string;
  mobileNumber:string;
  country:string;
  ZipCode:string;
  postalCode:string;
  organizationId:string;
  employeeJobs:string;
}
@Component({
  selector: 'app-employee-create',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.css'], 
  // standalone: true,
})
export class EmployeeCreateComponent {
  loading = false;
  value = '';
  disableSelect = new FormControl(false);
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('always' as FloatLabelType);
  togOff: boolean = false;
  model:any;
  employee:any = {};
  employees:any = [];
  snackbar:any;
  divItems: any[] = [];
  jobs: any[] = [];
  expandedElement: any;
  selectedJobTitle: string = '';
  selectedJobRate: number | undefined;
  // employeeForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  selectedOption: string;
  constructor(public dialog: MatDialog,private fb: FormBuilder,public dialogRef: MatDialogRef<EmployeeCreateComponent>,private _snackBar: MatSnackBar,private routers:Router,
   
    @Optional() @Inject(MAT_DIALOG_DATA) public data:Employee,private http:HttpClient,public route:Router, private cdr:ChangeDetectorRef) {
       if(data!=undefined){
      this.employee =data[0];
      console.log(data)

    }
  
      
    }
  myControl = new FormControl('');
  
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),  
    );
   this.selectedOption= this.employee.organizationId;
  }
 
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  getFloatLabelValue(): FloatLabelType {
    return this.floatLabelControl.value || 'always';
  }
  durationInSeconds=3;
  openSnackBar(message: string, isSuccess: boolean) {
    const panelClass = isSuccess ? ['success-snackbar'] : ['error-snackbar'];
  
    this._snackBar.open(message, '✘', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: panelClass 
    });
  }

  NameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(10),   
  ]);
  EmailFormControl= new FormControl('', [
    Validators.email,
    Validators.required,
  ]);
  SalaryFormControl= new FormControl('', [
    Validators.required,  
    Validators.pattern(/^-?\d*\.?\d+$/)
  ]);
  
  
  addEmployee() {
    this.NameFormControl.markAsTouched();
    this.EmailFormControl.markAsTouched();
    this.SalaryFormControl.markAsTouched();
    if (this.NameFormControl.invalid || this.EmailFormControl.invalid || this.SalaryFormControl.invalid) {
    } else {
      this.loading=true;
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
  
      if (!this.employee.employeeId) {
        this.http.post(`https://api.samotplatform.com/Employees`, this.employee, { 'headers': options })
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
            this.employees.push(data); // Add the new employee to the local array
            this.loading=false;
            this.openSnackBar("Employee Created Successfully",true);
            this.dialogRef.close( data );
          });
      } else {
        this.loading=true;
        this.http.put(`https://api.samotplatform.com/Employees/` + this.employee.employeeId, this.employee, { 'headers': options })
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
            const index = this.employees.findIndex(e => e.employeeId === this.employee.employeeId);
            if (index !== -1) {
              this.employees[index] = data; // Update the existing employee in the local array
            }
            this.openSnackBar("Employee Updated Successfully",true);
            this.loading=false;
            this.dialogRef.close(data );
          });
      }
    }
  }
  
  showNewComponent: boolean = false;

  addJobs() {
    this.divItems.push({
      selectedJobTitle: '',
      // selectedJobRate: undefined,
    });
  }
  deleteRow(index: number) {
    this.divItems.splice(index, 1);
  }

  updateRate(index: number) {
    // Find the selected job object based on the title
    const selectedJob = this.jobs.find(job => job.title === this.divItems[index].selectedJobTitle);
    // Update the rate field with the selected job's rate
    this.divItems[index].selectedJobRate = selectedJob.rate;

  }
  cancelDialog(){
    this.employee={} as any;
    this.dialogRef.close();
    
  }
}
