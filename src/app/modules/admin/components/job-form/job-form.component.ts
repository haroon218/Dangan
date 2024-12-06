import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FloatLabelType } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { Employee } from '../jobs-rate/jobs-rate.component';
@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent {

  value = '';
  disableSelect = new FormControl(false);
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('always' as FloatLabelType);
  togOff: boolean = false;
  model:any;
  employee:any = {};
  employees:any = [];
  snackbar:any;

  // employeeForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<JobFormComponent>,private _snackBar: MatSnackBar,private routers:Router,
   
    @Optional() @Inject(MAT_DIALOG_DATA) public data:Employee,private http:HttpClient,public route:Router, private cdr:ChangeDetectorRef) {
      this.employee={...data};
      console.log("Employee",this.employee);
      
    }
  myControl = new FormControl('');
  
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),  
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  getFloatLabelValue(): FloatLabelType {
    return this.floatLabelControl.value || 'always';
  }
  durationInSeconds=1;
  openSnackBar(message) {
    this._snackBar.open(message, 'Ok', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
      
    });
  }

  NameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(15),   
  ]);
 
  SalaryFormControl= new FormControl('', [
    Validators.required,  
    Validators.pattern(/^-?\d*\.?\d+$/)
  ]);
  
  
  addEmployee() {
    this.NameFormControl.markAsTouched();
    this.SalaryFormControl.markAsTouched();
    
    if (this.NameFormControl.invalid || this.SalaryFormControl.invalid) {
      console.log('Form is invalid');
    } else {
      const options = {
        "Authorization": "Bearer " + localStorage.getItem('token')
      };
  
      if (!this.employee.id) {
        this.http.post(`https://api.samotplatform.com/jobs`, this.employee, { 'headers': options })
          .subscribe(data => {
            console.log(data);
            this.employees.push(data); // Add the new employee to the local array
            this.openSnackBar("Job Created Successfully");
            this.dialogRef.close( data);
          });
      } else {
        this.http.put(`https://api.samotplatform.com/jobs/` + this.employee.id, this.employee, { 'headers': options })
          .subscribe(data => {
            const index = this.employees.findIndex(e => e.id === this.employee.id);
            if (index !== -1) {
              this.employees[index] = data; // Update the existing employee in the local array
            }
            this.openSnackBar(" Updated Successfully");
            this.dialogRef.close({data} );
          });
      }
    }
  }
  
  cancelDialog(){
    this.employee={} as any;
    this.dialogRef.close();
    
  }
}

